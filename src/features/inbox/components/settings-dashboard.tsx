"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  Globe,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";

import type { WorkspaceSettings } from "@/features/inbox/types";

type SettingsDashboardProps = {
  settings: WorkspaceSettings;
  onSaveSettings: (settings: WorkspaceSettings) => void;
};

export function SettingsDashboard({
  settings,
  onSaveSettings,
}: SettingsDashboardProps) {
  const [formData, setFormData] = useState<WorkspaceSettings>(settings);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#4F46E5");
  const [isSaved, setIsSaved] = useState(false);

  function handleSave() {
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  }

  function handleAddTag() {
    const clean = newTagName.trim().toLowerCase().replace(/^#/, "");
    if (!clean) return;
    if (formData.customTags.some((t) => t.name === clean)) return;

    setFormData({
      ...formData,
      customTags: [
        ...formData.customTags,
        { id: clean, name: clean, color: newTagColor },
      ],
    });
    setNewTagName("");
  }

  function handleRemoveTag(id: string) {
    setFormData({
      ...formData,
      customTags: formData.customTags.filter((t) => t.id !== id),
    });
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-background p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Workspace Settings & Configuration
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Configure your company profile, appearance, SLA automation, AI assistants, and notification preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary/90 transition-all active:scale-95"
        >
          {isSaved ? <Check className="size-4" /> : <Save className="size-4" />}
          <span>{isSaved ? "Saved Successfully" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: General Organization Profile */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Globe className="size-4 text-primary" />
            General Information
          </h3>

          <div className="space-y-3 rounded-lg border border-border p-4 bg-surface/20 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Workspace Name
              </label>
              <input
                type="text"
                value={formData.workspaceName}
                onChange={(e) =>
                  setFormData({ ...formData, workspaceName: e.target.value })
                }
                className="w-full rounded border border-border bg-background p-2 outline-none focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Workspace Slug / Subdomain
              </label>
              <div className="flex items-center rounded border border-border bg-background px-2 text-muted-foreground">
                <span className="text-[11px]">app.unifiedinbox.io/</span>
                <input
                  type="text"
                  value={formData.workspaceSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, workspaceSlug: e.target.value })
                  }
                  className="w-full bg-transparent p-2 text-foreground outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Primary Support Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
                className="w-full rounded border border-border bg-background p-2 outline-none focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Operational Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="w-full rounded border border-border bg-background p-2 outline-none focus:border-primary text-xs"
              >
                <option value="UTC - 05:00 Eastern Time (US & Canada)">
                  UTC - 05:00 Eastern Time (US & Canada)
                </option>
                <option value="UTC + 00:00 Greenwich Mean Time">
                  UTC + 00:00 Greenwich Mean Time
                </option>
                <option value="UTC + 06:00 Dhaka Standard Time">
                  UTC + 06:00 Dhaka Standard Time
                </option>
                <option value="UTC + 08:00 Singapore / Hong Kong">
                  UTC + 08:00 Singapore / Hong Kong
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: AI & Auto-Translation Engine */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Sparkles className="size-4 text-primary" />
            AI Copilot & Multi-Lingual Automation
          </h3>

          <div className="space-y-4 rounded-lg border border-border p-4 bg-surface/20 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Smart AI Suggestions
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Predict and generate recommended canned responses per ticket.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.enableAiSuggestions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enableAiSuggestions: e.target.checked,
                  })
                }
                className="size-4 accent-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Automatic Translation
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Real-time translation for foreign inbound language messages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.enableAutoTranslation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enableAutoTranslation: e.target.checked,
                  })
                }
                className="size-4 accent-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Default Translation Language
              </label>
              <select
                value={formData.defaultTranslateLanguage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultTranslateLanguage: e.target.value,
                  })
                }
                className="w-full rounded border border-border bg-background p-2 outline-none focus:border-primary text-xs"
              >
                <option value="en">English</option>
                <option value="es">Spanish (Español)</option>
                <option value="fr">French (Français)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="de">German (Deutsch)</option>
                <option value="ja">Japanese (日本語)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Custom Tags & Taxonomy */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Tag className="size-4 text-primary" />
            Custom Tags & Triage Taxonomy
          </h3>

          <div className="space-y-3 rounded-lg border border-border p-4 bg-surface/20 text-xs">
            <div className="flex flex-wrap gap-1.5">
              {formData.customTags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1 text-xs font-semibold"
                  style={{ color: tag.color }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  #{tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="New tag name (e.g. vip)..."
                className="min-w-0 flex-1 rounded border border-border bg-background p-1.5 text-xs outline-none focus:border-primary"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="size-7 rounded cursor-pointer border border-border p-0.5 bg-background"
                title="Tag color"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Notification Preferences */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Bell className="size-4 text-primary" />
            Notification Rules & Routing
          </h3>

          <div className="space-y-3 rounded-lg border border-border p-4 bg-surface/20 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Audible Sound Alerts
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Play sound when new high-priority customer message arrives.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationSounds}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationSounds: e.target.checked,
                  })
                }
                className="size-4 accent-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Browser Desktop Notifications
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Push desktop notification for unassigned tickets.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.desktopNotifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    desktopNotifications: e.target.checked,
                  })
                }
                className="size-4 accent-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                Team Email Digest
              </label>
              <select
                value={formData.emailDigest}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emailDigest: e.target.value as WorkspaceSettings["emailDigest"],
                  })
                }
                className="w-full rounded border border-border bg-background p-2 outline-none focus:border-primary text-xs"
              >
                <option value="instant">Instant per message</option>
                <option value="daily">Daily morning summary</option>
                <option value="weekly">Weekly performance digest</option>
                <option value="off">Muted (Off)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
