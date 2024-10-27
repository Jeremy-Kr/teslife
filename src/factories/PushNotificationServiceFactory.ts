import { PushNotificationService } from "@/services/PushNotificationService";
import { SupabaseDatabase } from "@/services/SupabaseDatabase";
import { IPushNotificationService } from "@/models/notification/IPushNotificationService";

export class PushNotificationServiceFactory {
  static create(): IPushNotificationService {
    const database = new SupabaseDatabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    return PushNotificationService.getInstance(database);
  }
}
