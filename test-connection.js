const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase connection...');
    // 尝试查询一个不存在的表，看是否返回错误
    const { data, error } = await supabase.from('nonexistent').select('*').limit(1);
    if (error) {
        console.log('Connection error (expected):', error.message);
        console.log('Error code:', error.code);
        console.log('Error details:', error.details);
    } else {
        console.log('Unexpected success:', data);
    }
}

test().catch(console.error);