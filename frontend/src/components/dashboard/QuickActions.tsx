import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, PackagePlus, ReceiptText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Each action navigates to its page with ?new=1 — the destination page reads
// that on mount and auto-opens its "add" dialog, then cleans the URL.
const ACTIONS = [
  { label: 'New sale', icon: PlusCircle, path: '/sales' },
  { label: 'Add customer', icon: UserPlus, path: '/customers' },
  { label: 'Add product', icon: PackagePlus, path: '/inventory' },
  { label: 'Log expense', icon: ReceiptText, path: '/expenses' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Jump straight into common tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            onClick={() => navigate(`${action.path}?new=1`)}
          >
            <action.icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
