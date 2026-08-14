import { useNavigate } from 'react-router-dom';
import { Sparkles, PackagePlus, PlusCircle, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Same "?new=1 auto-opens the add dialog" convention as QuickActions — no
// new routes or backend behavior, just pointing at what already exists.
const FIRST_ACTIONS = [
  { label: 'Add products', icon: PackagePlus, path: '/inventory?new=1' },
  { label: 'Record a sale', icon: PlusCircle, path: '/sales?new=1' },
  { label: 'Add customers', icon: UserPlus, path: '/customers?new=1' },
];

/** Shown on Mission Control only while an account has zero sales history —
 *  see MissionControlPage's `hasInsufficientData`. Replaces "here's a
 *  dashboard full of empty cards" with a direct next step. */
export function FirstRunGuide() {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Let's get your business intelligence started
        </CardTitle>
        <CardDescription>
          BizPilot learns from real activity — add a few products, record a sale, or add a customer, and this page
          will start filling in with real numbers and AI recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FIRST_ACTIONS.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 bg-card py-4"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
