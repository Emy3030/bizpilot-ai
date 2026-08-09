import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { SectionIntro } from './SectionIntro';
import { cn } from '@/utils/cn';

const FAQS = [
  {
    question: 'Can the AI actually spend my money or change my stock without asking?',
    answer:
      "No. Every action your AI team proposes — a restock, a sale, a discount campaign — sits in an approval queue until you approve it. Nothing executes on its own unless you've explicitly turned that on.",
  },
  {
    question: 'What happens to my data?',
    answer:
      "Your business data stays yours, scoped entirely to your account. It's used only to power your own AI team's recommendations — never shared or used to train models for anyone else.",
  },
  {
    question: 'How does the blockchain verification actually work?',
    answer:
      "Every invoice and receipt gets a SHA-256 hash of its contents anchored on-chain. The document itself never touches the blockchain — only proof it hasn't been altered. Anyone can verify a receipt by scanning its QR code, no login required.",
  },
  {
    question: 'Do I need to already have clean, organized data to start?',
    answer:
      "No. Add your first product or record your first sale and your AI team starts working from there. It gets sharper as more of your business history builds up.",
  },
  {
    question: "What if the AI gets something wrong?",
    answer:
      "It's built to say 'I don't know' rather than guess — it never invents numbers, customers, or stock levels it can't verify. And since every action needs your approval, you're always the last check before anything happens.",
  },
  {
    question: 'Can my staff use it too?',
    answer:
      'Yes — accounts support owner and staff roles today, with granular per-role permissions (including what staff can ask the AI to do) on our roadmap.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium sm:text-base">{question}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro eyebrow="FAQ" title="Questions you're probably asking" />

        <div className="mx-auto mt-14 max-w-2xl">
          {FAQS.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
