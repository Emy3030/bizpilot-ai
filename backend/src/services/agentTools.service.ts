import { SchemaType, FunctionDeclaration } from '@google/generative-ai';
import { customerService } from './customer.service';
import { productService } from './product.service';
import { agentActionService } from './agentAction.service';
import { ApiError } from '../utils/ApiError';

/**
 * Every tool the AI Agent can call. Descriptions matter a lot here — Gemini
 * decides *when* to call each function based on them, so they're written as
 * instructions, not just labels.
 *
 * search_customers and search_products are read-only lookups and execute
 * immediately. create_customer and record_sale are WRITES — they never
 * touch the database directly. They queue a PENDING AgentAction for the
 * owner to approve; nothing is created or recorded until the owner
 * approves it from their Pending Approvals list.
 */
export const AGENT_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'search_customers',
    description:
      'Search existing customers by name or phone number. ALWAYS call this before proposing a new customer, ' +
      'to check whether they already exist. Returns up to 5 matches with their id, name, phone, and outstanding debt.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Customer name or phone number to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_customer',
    description:
      'Proposes a new customer record for the owner to approve. This does NOT create the customer immediately — ' +
      'it queues the proposal in the owner\'s Pending Approvals, and only actually creates it once they approve. ' +
      'Only call this after search_customers has confirmed the customer does not already exist, AND you have ' +
      'collected at least their name and phone number from the user in the conversation. Business name, email, ' +
      'and address are optional — ask for them only after you have name and phone, and only if the user is ' +
      'willing to share them; do not block on these.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        businessName: { type: SchemaType.STRING, description: 'Optional' },
        email: { type: SchemaType.STRING, description: 'Optional' },
        address: { type: SchemaType.STRING, description: 'Optional' },
        reason: {
          type: SchemaType.STRING,
          description: 'One short sentence on why you are proposing this, shown to the owner in the approval queue.',
        },
      },
      required: ['name', 'phone', 'reason'],
    },
  },
  {
    name: 'search_products',
    description:
      'Search the product/inventory catalog by name. Use this to resolve every product mentioned by the user into ' +
      'a real productId before proposing a sale. Returns matches with id, name, sellingPrice, and current stockQuantity. ' +
      'If a product is out of stock or not found, tell the user — do not guess or invent a productId.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Product name to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'record_sale',
    description:
      'Proposes a completed sale for the owner to approve. This does NOT record the sale immediately — it queues ' +
      'the proposal in the owner\'s Pending Approvals. Only once approved does it actually: verify stock, decrement ' +
      'inventory, calculate totals, update the customer\'s outstanding debt if unpaid/partial, generate an invoice, ' +
      'generate a receipt, and anchor the receipt hash on the blockchain. Call this only after: (1) the customer is ' +
      'resolved — either an existing customerId from search_customers, or omitted entirely for a walk-in sale, ' +
      '(2) every item has a real productId from search_products with enough stock, and (3) you have asked the user ' +
      'how they are paying (fully paid now, on credit, or a partial payment) and know the amount.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        customerId: {
          type: SchemaType.STRING,
          description: 'Omit entirely for a walk-in sale with no customer on record',
        },
        items: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              productId: { type: SchemaType.STRING },
              quantity: { type: SchemaType.NUMBER },
            },
            required: ['productId', 'quantity'],
          },
        },
        paymentMethod: {
          type: SchemaType.STRING,
          enum: ['CASH', 'TRANSFER', 'CARD', 'CREDIT'],
          description: 'How the payment (or debt, if any) is being tracked',
        },
        amountPaid: {
          type: SchemaType.NUMBER,
          description:
            '0 for a fully-on-credit sale, the full total for a fully paid sale, or a partial number for a partial payment',
        },
        reason: {
          type: SchemaType.STRING,
          description: 'One short sentence on why you are proposing this, shown to the owner in the approval queue.',
        },
      },
      required: ['items', 'paymentMethod', 'amountPaid', 'reason'],
    },
  },
];

interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

const MAX_SEARCH_RESULTS = 5;

/**
 * Executes one tool call, scoped to the authenticated user. Never throws —
 * errors are returned as structured data so the model can relay them to the
 * user in natural language instead of the request crashing.
 */
export async function executeAgentTool(
  userId: string,
  name: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  try {
    switch (name) {
      case 'search_customers': {
        const query = String(args.query || '');
        const result = await customerService.list(userId, { search: query, page: 1, limit: MAX_SEARCH_RESULTS });
        return {
          success: true,
          data: {
            matches: result.customers.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              email: c.email,
              outstandingDebt: Number(c.outstandingDebt),
            })),
          },
        };
      }

      case 'create_customer': {
        const name = String(args.name || '');
        const phone = args.phone ? String(args.phone) : undefined;

        const action = await agentActionService.queue(userId, {
          type: 'CREATE_CUSTOMER',
          summary: `Add new customer: ${name}${phone ? ` (${phone})` : ''}`,
          reasoning: args.reason ? String(args.reason) : undefined,
          payload: {
            name,
            phone,
            email: args.email ? String(args.email) : undefined,
            address: args.address ? String(args.address) : undefined,
          },
        });

        return {
          success: true,
          data: {
            queued: true,
            actionId: action.id,
            message: `Prepared "${action.summary}" — awaiting the owner's approval before it's actually created.`,
          },
        };
      }

      case 'search_products': {
        const query = String(args.query || '');
        const result = await productService.list(userId, {
          search: query,
          page: 1,
          limit: MAX_SEARCH_RESULTS,
        });
        return {
          success: true,
          data: {
            matches: result.products.map((p) => ({
              id: p.id,
              name: p.name,
              sellingPrice: Number(p.sellingPrice),
              stockQuantity: p.stockQuantity,
            })),
          },
        };
      }

      case 'record_sale': {
        const items = Array.isArray(args.items)
          ? (args.items as { productId: string; quantity: number }[])
          : [];
        if (items.length === 0) {
          return { success: false, error: 'At least one item is required to record a sale' };
        }

        const itemSummaries = await Promise.all(
          items.map(async (item) => {
            try {
              const product = await productService.getById(userId, item.productId);
              return `${item.quantity}x ${product.name}`;
            } catch {
              return `${item.quantity}x (unknown product)`;
            }
          })
        );

        let customerName = 'walk-in customer';
        if (args.customerId) {
          try {
            const customer = await customerService.getById(userId, String(args.customerId));
            customerName = customer.name;
          } catch {
            // fall through with the default label — the approval payload still has the real id
          }
        }

        const action = await agentActionService.queue(userId, {
          type: 'RECORD_SALE',
          summary: `Sell ${itemSummaries.join(', ')} to ${customerName}`,
          reasoning: args.reason ? String(args.reason) : undefined,
          payload: {
            customerId: args.customerId ? String(args.customerId) : undefined,
            items,
            paymentMethod: args.paymentMethod,
            amountPaid: Number(args.amountPaid || 0),
          },
        });

        return {
          success: true,
          data: {
            queued: true,
            actionId: action.id,
            message: `Prepared "${action.summary}" — awaiting the owner's approval before it's actually recorded.`,
          },
        };
      }

      default:
        return { success: false, error: `Unknown tool: ${name}` };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    // eslint-disable-next-line no-console
    console.error(`[Agent] Tool "${name}" failed unexpectedly:`, error);
    return { success: false, error: 'Something went wrong performing that action. Please try again.' };
  }
}
