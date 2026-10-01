export type NotificationType = "LEASE_EXPIRED" | (string & {});

export interface NotificationPayload {
  leaseId?: string;
  unitId?: string;
  endDate?: string;
  unitNumber?: string;
  leaseNumber?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  payload?: NotificationPayload | null;
  created_at: string;
  read_at: string | null;
  is_read: boolean;
}
