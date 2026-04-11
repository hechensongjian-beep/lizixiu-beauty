const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrdzmohjsteykvxszwve.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6ZHptb2hqc3RleWt2eHN6d3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzE0NjEsImV4cCI6MjA1OTY0NzQ2MX0.DgVo2c3oVnAzj3_1YnsPj4_9Q9JfV4NlLxR9yR-7G-k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    try {
        // 尝试查询一个不存在的表，期望得到 404/406 错误，但连接应成功
        const { data, error } = await supabase.from('_nonexistent').select('*').limit(1);
        if (error) {
            console.log('Error code:', error.code);
            console.log('Error message:', error.message);
            // 根据错误类型判断
            if (error.code === 'PGRST000' || error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
                console.log('❌ Project likely PAUSED or network issue.');
                process.exit(1);
            } else if (error.code === '42P01') { // 表不存在错误，表示连接成功
                console.log('✅ Connection successful (project ACTIVE).');
                process.exit(0);
            } else {
                console.log('⚠️ Unexpected error but connection might be active:', error.code);
                process.exit(0);
            }
        } else {
            console.log('Unexpected success:', data);
            process.exit(0);
        }
    } catch (err) {
        console.log('Exception:', err.message);
        process.exit(1);
    }
}

test();