import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants';
import { makePaymentLink, paymentCode } from '@/lib/pocketAdmin';
import {
  BOOKINGS_SEED,
  PAYMENTS_SEED,
  getPreset,
  type Booking,
  type BookingStatus,
  type Payment,
  type TaxRegimeId,
} from '@/mock/pocketAdmin';

/**
 * Рабочее состояние Блока 4: записи, платежи, выбранный пресет ниши и налоговый
 * режим. Персистится — созданные записи и проведённые платежи сохраняются.
 * Текущая генерируемая оплата (pending) в persist не сохраняется.
 */

export interface PendingPayment {
  code: string;
  link: string;
  amount: number;
  service: string;
  clientName: string;
  bookingId?: string;
}

export interface NewBookingInput {
  clientId: string;
  service: string;
  price: number;
  dayOffset: number;
  time: string;
  durationMin: number;
}

interface PocketAdminState {
  presetId: string;
  regime: TaxRegimeId;
  bookings: Booking[];
  payments: Payment[];
  pending: PendingPayment | null;
  lastPaidId: string | null;

  setPreset: (id: string) => void;
  setRegime: (id: TaxRegimeId) => void;
  addBooking: (input: NewBookingInput) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  generatePayment: (input: { amount: number; service: string; clientName: string; bookingId?: string }) => void;
  clearPending: () => void;
  markPaid: () => void;
  reset: () => void;
}

const initialRegime = getPreset('horeca').defaultRegime;

export const usePocketAdminStore = create<PocketAdminState>()(
  persist(
    (set) => ({
      presetId: 'horeca',
      regime: initialRegime,
      bookings: BOOKINGS_SEED,
      payments: PAYMENTS_SEED,
      pending: null,
      lastPaidId: null,

      setPreset: (id) => set({ presetId: id, regime: getPreset(id).defaultRegime }),
      setRegime: (regime) => set({ regime }),

      addBooking: (input) =>
        set((s) => ({
          bookings: [
            { id: `b${Date.now()}`, status: 'new', prepaid: false, ...input },
            ...s.bookings,
          ],
        })),

      setBookingStatus: (id, status) =>
        set((s) => ({
          bookings: s.bookings.map((b) =>
            b.id === id ? { ...b, status, prepaid: status === 'prepaid' ? true : b.prepaid } : b,
          ),
        })),

      generatePayment: ({ amount, service, clientName, bookingId }) => {
        const code = paymentCode();
        set({ pending: { code, link: makePaymentLink(code), amount, service, clientName, bookingId } });
      },

      clearPending: () => set({ pending: null }),

      markPaid: () =>
        set((s) => {
          if (!s.pending) return s;
          const payment: Payment = {
            id: `p${Date.now()}`,
            clientName: s.pending.clientName,
            service: s.pending.service,
            amount: s.pending.amount,
            method: 'qr',
            daysAgo: 0,
            status: 'paid',
          };
          const bookings = s.pending.bookingId
            ? s.bookings.map((b) => (b.id === s.pending!.bookingId ? { ...b, status: 'prepaid' as const, prepaid: true } : b))
            : s.bookings;
          return { payments: [payment, ...s.payments], bookings, pending: null, lastPaidId: payment.id };
        }),

      reset: () =>
        set({
          presetId: 'horeca',
          regime: initialRegime,
          bookings: BOOKINGS_SEED,
          payments: PAYMENTS_SEED,
          pending: null,
          lastPaidId: null,
        }),
    }),
    {
      name: STORAGE_KEYS.pocketAdmin,
      partialize: (s) => ({ presetId: s.presetId, regime: s.regime, bookings: s.bookings, payments: s.payments }),
    },
  ),
);
