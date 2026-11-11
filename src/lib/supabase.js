import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// Uploads an image to the public "media" bucket and returns its URL
export async function uploadImage(file, folder = 'uploads') {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const key = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('media').upload(key, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(key).data.publicUrl
}

export const inquiryRef = (n) => `CEY-${String(n).padStart(5, '0')}`
