import { InboxWorkspace } from "@/features/inbox/inbox-workspace";
import { I18nProvider } from "@/features/inbox/i18n";

export default function HomePage() {
  return (
    <I18nProvider>
      <InboxWorkspace />
    </I18nProvider>
  );
}
