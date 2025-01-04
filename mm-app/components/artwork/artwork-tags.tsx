'use client';

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface ArtworkTagsProps {
  label: string;
  tags: string[];
  onRemove: (tag: string) => void;
  onAdd: (tag: string) => void;
}

export function ArtworkTags({ label, tags = [], onRemove, onAdd }: ArtworkTagsProps) {
  const [newTag, setNewTag] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      onAdd(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="px-2 py-1 text-sm flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
            onClick={() => onRemove(tag)}
          >
            {tag}
            <X className="h-3 w-3" />
          </Badge>
        ))}
      </div>
      <Input
        placeholder={`Add ${label.toLowerCase()}...`}
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleKeyDown}
        className="max-w-sm"
      />
    </div>
  );
} 