'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Database } from '@/lib/types/database.types'
import { formatCurrency } from '@/lib/utils/core/format-utils'

type GhostProfile = Database['public']['Tables']['ghost_profiles']['Row']

interface Props {
  initialProfiles: GhostProfile[]
  updateVisibility: (id: string, makeVisible: boolean) => Promise<{ error: any | null }>
  updateBatchVisibility: (ids: string[], makeVisible: boolean) => Promise<{ error: any | null }>
}

export function GhostProfilesList({ 
  initialProfiles, 
  updateVisibility, 
  updateBatchVisibility 
}: Props) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === profiles.length 
        ? []
        : profiles.map(p => p.id)
    )
  }

  const handleVisibilityToggle = async (id: string) => {
    try {
      setIsUpdating(true)
      const profile = profiles.find(p => p.id === id)
      if (!profile) return

      const { error } = await updateVisibility(id, !profile.is_visible)

      if (error) throw error

      setProfiles(prev => 
        prev.map(p => 
          p.id === id 
            ? { ...p, is_visible: !p.is_visible }
            : p
        )
      )

      toast.success(
        `Profile ${!profile.is_visible ? 'shown' : 'hidden'} successfully`
      )
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast.error('Failed to update visibility')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBatchVisibilityToggle = async (makeVisible: boolean) => {
    if (selectedIds.length === 0) return

    try {
      setIsUpdating(true)
      const { error } = await updateBatchVisibility(selectedIds, makeVisible)

      if (error) throw error

      setProfiles(prev => 
        prev.map(p => 
          selectedIds.includes(p.id)
            ? { ...p, is_visible: makeVisible }
            : p
        )
      )

      setSelectedIds([])
      toast.success(
        `${selectedIds.length} profiles ${makeVisible ? 'shown' : 'hidden'} successfully`
      )
    } catch (error) {
      console.error('Error updating batch visibility:', error)
      toast.error('Failed to update profiles')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      {selectedIds.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchVisibilityToggle(true)}
            disabled={isUpdating}
          >
            <Eye className="w-4 h-4 mr-2" />
            Show Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchVisibilityToggle(false)}
            disabled={isUpdating}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">
                <Checkbox
                  checked={selectedIds.length === profiles.length}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Display Name</th>
              <th className="p-2 text-right">Total Purchases</th>
              <th className="p-2 text-right">Total Spent</th>
              <th className="p-2 text-center">Claimed</th>
              <th className="p-2 text-center">Visible</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b">
                <td className="p-2">
                  <Checkbox
                    checked={selectedIds.includes(profile.id)}
                    onCheckedChange={() => handleSelection(profile.id)}
                  />
                </td>
                <td className="p-2">{profile.email}</td>
                <td className="p-2">{profile.display_name}</td>
                <td className="p-2 text-right">{profile.total_purchases}</td>
                <td className="p-2 text-right">
                  {formatCurrency(profile.total_spent || 0)}
                </td>
                <td className="p-2 text-center">
                  {profile.is_claimed ? (
                    <Check className="w-4 h-4 mx-auto text-green-500" />
                  ) : (
                    <X className="w-4 h-4 mx-auto text-red-500" />
                  )}
                </td>
                <td className="p-2 text-center">
                  {profile.is_visible ? (
                    <Check className="w-4 h-4 mx-auto text-green-500" />
                  ) : (
                    <X className="w-4 h-4 mx-auto text-red-500" />
                  )}
                </td>
                <td className="p-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVisibilityToggle(profile.id)}
                    disabled={isUpdating}
                  >
                    {profile.is_visible ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 