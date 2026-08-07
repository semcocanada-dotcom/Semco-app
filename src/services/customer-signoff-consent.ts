import {
  PRIVACY_POLICY_URL,
  SEMCO_PRIVACY_EMAIL,
  SEMCO_SUPPORT_URL,
} from '@/constants/legal';

export const CUSTOMER_SIGNOFF_CONSENT_VERSION = 'customer-signoff-privacy-2026-08-07-v1';
export const CUSTOMER_SIGNOFF_CONSENT_VERSION_KEY = '_customerPrivacyConsentVersion';
export const CUSTOMER_SIGNOFF_CONSENT_ACCEPTED_AT_KEY = '_customerPrivacyConsentAcceptedAt';
export const CUSTOMER_SIGNOFF_CONSENT_NOTICE_KEY = '_customerPrivacyConsentNotice';

export const CUSTOMER_SIGNOFF_PRIVACY_NOTICE =
  `Before entering or signing this form, the customer confirms they understand that Semco Pro will store their name, email (if provided), signature, completed PDF, and related project details in Supabase-hosted cloud storage. Semco Canada administrators and the project's assigned dealer may access these records to document and review the project, support orders and warranty work, and resolve record or service questions. Records are retained while needed for the installer account, project administration, warranty or order support, and legal or business recordkeeping. The installer can permanently delete their account and associated project records in Account and Security. The customer or installer can ask privacy questions at ${SEMCO_PRIVACY_EMAIL} or ${SEMCO_SUPPORT_URL}. A customer email is stored with the project and is not emailed automatically.`;

export type CustomerSignoffConsentAudit = {
  version: string;
  acceptedAt: string;
  notice: string;
};

export function addCustomerSignoffConsentAudit(
  formData: Record<string, string>,
  acceptedAt: string,
): Record<string, string> {
  if (!acceptedAt) throw new Error('Customer privacy acknowledgement is required.');
  return {
    ...formData,
    [CUSTOMER_SIGNOFF_CONSENT_VERSION_KEY]: CUSTOMER_SIGNOFF_CONSENT_VERSION,
    [CUSTOMER_SIGNOFF_CONSENT_ACCEPTED_AT_KEY]: acceptedAt,
    [CUSTOMER_SIGNOFF_CONSENT_NOTICE_KEY]: CUSTOMER_SIGNOFF_PRIVACY_NOTICE,
  };
}

export function readCustomerSignoffConsentAudit(
  formData: Record<string, string>,
): CustomerSignoffConsentAudit | null {
  const version = formData[CUSTOMER_SIGNOFF_CONSENT_VERSION_KEY];
  const acceptedAt = formData[CUSTOMER_SIGNOFF_CONSENT_ACCEPTED_AT_KEY];
  const notice = formData[CUSTOMER_SIGNOFF_CONSENT_NOTICE_KEY];
  if (version !== CUSTOMER_SIGNOFF_CONSENT_VERSION || !acceptedAt || !notice) return null;
  return { version, acceptedAt, notice };
}

export const CUSTOMER_SIGNOFF_PRIVACY_POLICY_URL = PRIVACY_POLICY_URL;
export const CUSTOMER_SIGNOFF_SUPPORT_URL = SEMCO_SUPPORT_URL;
