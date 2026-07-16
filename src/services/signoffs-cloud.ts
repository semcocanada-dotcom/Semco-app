import { supabase } from '@/services/supabase';
import type { SignoffTemplate } from '@/constants/project-signoffs';
import { createPrivateFileUrl } from '@/services/private-storage';

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

const SIGNED_URL_TTL_SECONDS = 60 * 60;

// Kept free of pdf-lib imports so the web portal bundle can use it.
export async function getSignoffPdfViewUrl(pdfUrl: string): Promise<string | null> {
  // Rows synced before the bucket went private stored a full public URL.
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;

  try {
    return await createPrivateFileUrl('project-signoffs', pdfUrl, SIGNED_URL_TTL_SECONDS);
  } catch (err) {
    console.error('[signoffs-cloud] signed url failed:', err);
    return null;
  }
}

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
