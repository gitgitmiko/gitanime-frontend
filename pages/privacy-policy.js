import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Head>
        <title>Kebijakan Privasi - GitAnime</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://gitanime-web.vercel.app/privacy-policy" />
      </Head>
      <h1 className="text-3xl font-bold text-white mb-2">Kebijakan Privasi</h1>
      <p className="text-dark-300">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
      <p className="text-dark-200">Kami menghargai privasi Anda. Halaman ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Informasi yang Kami Kumpulkan</h2>
      <p className="text-dark-200">Log server, data analitik agregat (anonim), dan preferensi aplikasi.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Penggunaan Informasi</h2>
      <p className="text-dark-200">Untuk peningkatan layanan, keamanan, dan pengalaman pengguna.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Cookie</h2>
      <p className="text-dark-200">Kami dapat menggunakan cookie untuk menyimpan preferensi.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Kontak</h2>
      <p className="text-dark-200">Jika ada pertanyaan, hubungi admin melalui halaman kontak atau repository.</p>
    </div>
  );
}


