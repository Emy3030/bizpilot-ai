import { Rocket } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'AI Executive Team', href: '#ai-team' },
    { label: 'Mission Control', href: '#mission-control' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'How it works', href: '#workflow' },
    { label: 'FAQ', href: '#faq' },
  ],
  'Get started': [
    { label: 'Log in', href: '/login' },
    { label: 'Create an account', href: '/register' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Rocket className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold tracking-tight">BizPilot</span>
            </div>
            <p className="mt-3 max-w-[220px] text-sm text-muted-foreground">
              Your AI Chief Operating Officer.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-sm font-semibold">{heading}</p>
              <ul className="mt-3 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} BizPilot. All rights reserved.</p>
          <p>Your AI Chief Operating Officer, for business owners who lead.</p>
        </div>
      </div>
    </footer>
  );
}
