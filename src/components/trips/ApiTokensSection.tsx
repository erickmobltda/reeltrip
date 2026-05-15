import { useState } from 'react'
import { KeyRound, Copy, Check, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useApiTokens } from '@/hooks/useApiTokens'

interface ApiTokensSectionProps {
  tripId: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ApiTokensSection({ tripId }: ApiTokensSectionProps) {
  const { tokens, loading, createToken, revokeToken } = useApiTokens(tripId)

  const [genOpen, setGenOpen] = useState(false)
  const [tokenName, setTokenName] = useState('')
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState(false)

  async function handleGenerate() {
    setBusy(true)
    setError(null)
    try {
      const raw = await createToken(tokenName)
      setGeneratedToken(raw)
      setTokenName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate token')
    } finally {
      setBusy(false)
    }
  }

  async function handleCopy() {
    if (!generatedToken) return
    await navigator.clipboard.writeText(generatedToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleGenClose(open: boolean) {
    if (busy) return
    setGenOpen(open)
    if (!open) {
      setGeneratedToken(null)
      setTokenName('')
      setError(null)
      setCopied(false)
    }
  }

  async function handleRevoke() {
    if (!revokeId) return
    setRevoking(true)
    try {
      await revokeToken(revokeId)
    } finally {
      setRevoking(false)
      setRevokeId(null)
    }
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">API Access</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => setGenOpen(true)}>
          <Plus className="h-4 w-4" />
          Generate token
        </Button>
      </div>

      {loading ? null : tokens.length === 0 ? (
        <p className="text-sm text-gray-400">
          No tokens yet. Generate one to submit URLs via the API.
        </p>
      ) : (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Last used</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tokens.map((t) => (
                <tr key={t.id} className="bg-white">
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {t.name ?? <span className="text-gray-400 font-normal italic">unnamed</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(t.created_at)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.last_used_at ? formatDate(t.last_used_at) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setRevokeId(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate token dialog */}
      <Dialog open={genOpen} onOpenChange={handleGenClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate API token</DialogTitle>
            <DialogDescription>
              This token lets you submit URLs to this trip via the API. It will be shown once.
            </DialogDescription>
          </DialogHeader>

          {generatedToken ? (
            <div className="space-y-3">
              <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                Copy this token now — it will not be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-xs font-mono text-gray-800 break-all select-all">
                  {generatedToken}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="token-name">Token name (optional)</Label>
                <Input
                  id="token-name"
                  placeholder="e.g. my script, Zapier, n8n"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  disabled={busy}
                />
              </div>
              {error && (
                <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            {generatedToken ? (
              <Button onClick={() => handleGenClose(false)}>Done</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => handleGenClose(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={busy}>
                  {busy ? 'Generating…' : 'Generate'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revokeId} onOpenChange={(open) => { if (!open) setRevokeId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke token</DialogTitle>
            <DialogDescription>
              This token will stop working immediately. Any integrations using it will break.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeId(null)} disabled={revoking}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={handleRevoke}
              disabled={revoking}
            >
              {revoking ? 'Revoking…' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
