/** Admin WhatsApp contact (digits only, international format). Override with NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201150578533').replace(/\D/g, '');

export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
