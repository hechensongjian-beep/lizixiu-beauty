import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('wechat_qr_url, alipay_qr_url, merchant_name')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Payment settings error:', error);
      return NextResponse.json({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' });
    }

    return NextResponse.json({
      wechatQr: data?.wechat_qr_url || '',
      alipayQr: data?.alipay_qr_url || '',
      merchantName: data?.merchant_name || '丽姿秀',
    });
  } catch (e) {
    console.error('Payment settings fetch error:', e);
    return NextResponse.json({ wechatQr: '', alipayQr: '', merchantName: '丽姿秀' });
  }
}

export async function POST(request: Request) {
  try {
    const { wechatQr, alipayQr, merchantName } = await request.json();

    const { data, error } = await supabase
      .from('payment_settings')
      .upsert({
        id: 1,
        wechat_qr_url: wechatQr || null,
        alipay_qr_url: alipayQr || null,
        merchant_name: merchantName || '丽姿秀',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Save payment settings error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error('Save payment settings error:', e);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
