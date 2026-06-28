import { supabase } from '@/services/supabase';
import type { SignoffTemplate } from '@/constants/project-signoffs';

type SyncProjectSignoffInput = {
  id: string;
  projectId: string;
  installerId: string;
  template: SignoffTemplate;
  status: 'draft' | 'signed';
  customerName?: string | null;
  customerEmail?: string | null;
  summary?: string | null;
  notes?: string | null;
  formData: Record<string, string>;
  signatureData?: string | null;
  signedAt?: string | null;
  cloudPdfUrl?: string | null;
  updatedAt: string;
};

export async function syncProjectSignoffToCloud(input: SyncProjectSignoffInput): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_signoffs')
      .upsert({
        id: input.id,
        project_id: input.projectId,
        installer_id: input.installerId,
        type: input.template.type,
        status: input.status,
        title: input.template.title,
        customer_name: input.customerName || null,
        customer_email: input.customerEmail || null,
        summary: input.summary || null,
        notes: input.notes || null,
        form_data: input.formData,
        signature_data: input.signatureData || null,
        pdf_url: input.cloudPdfUrl || null,
        signed_at: input.signedAt || null,
        updated_at: input.updatedAt,
      }, { onConflict: 'id' });

    if (error) {
      console.error('[signoffs-cloud] sync error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[signoffs-cloud] sync failed:', err);
    return false;
  }
}
