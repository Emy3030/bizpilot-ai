import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldX, Loader2, Rocket, Sun, Moon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChainStatusAnimation } from '@/components/blockchain/ChainStatusAnimation';
import { VerificationTimeline } from '@/components/blockchain/VerificationTimeline';
import { CleanverseTrustBadge } from '@/components/blockchain/CleanverseTrustBadge';
import { verifyApi } from '@/services/saleApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { useTheme } from '@/context/ThemeContext';

export default function VerifyPage() {
  const { hash } = useParams<{ hash: string }>();
  const { theme, toggleTheme } = useTheme();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify', hash],
    queryFn: () => verifyApi.verify(hash as string),
    enabled: !!hash,
    retry: false,
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/40 px-4">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-4"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Rocket className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight">BizPilot — Record Verification</h1>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5">
          <CardContent className="p-6">
            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Checking record...</p>
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <ShieldX className="h-10 w-10 text-destructive" />
                <p className="font-semibold">Record not found</p>
                <p className="text-sm text-muted-foreground">
                  This hash doesn't match any invoice or receipt on file. It may be invalid or the
                  document may have been tampered with.
                </p>
              </div>
            )}

            {data && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2 border-b border-border pb-4 text-center">
                  <ShieldCheck className="h-10 w-10 text-success" />
                  <p className="font-semibold">Record verified</p>
                  <p className="text-sm text-muted-foreground">
                    This {data.documentType.toLowerCase()} is authentic and unaltered.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <Row label="Issued by" value={data.businessName} />
                  <Row label="Document" value={`${data.documentType} · ${data.documentNumber}`} />
                  <Row label="Amount" value={formatCurrency(data.totalAmount, data.currency)} />
                  <Row label="Issued on" value={new Date(data.issuedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} />
                </div>

                <ChainStatusAnimation status={data.chainStatus} txHash={data.txHash} />

                <CleanverseTrustBadge trust={data.cleanverseTrust} />

                <div className="rounded-lg border border-border p-4">
                  <VerificationTimeline chainStatus={data.chainStatus} issuedAt={data.issuedAt} />
                </div>

                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Document hash</p>
                  <p className="break-all font-mono text-xs">{data.documentHash}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
