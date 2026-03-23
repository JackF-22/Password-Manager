export type PasswordRow = {
  id: string;
  user_id: string;
  site_name: string;
  username: string;
  encrypted_value: string;
  iv: string;
  salt: string;
  is_favorite: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};
