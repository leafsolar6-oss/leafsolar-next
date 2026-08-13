'use client';
export default function Newsletter() {
  return (
    <form className="mt-4 flex gap-2" onSubmit={(e)=>{e.preventDefault(); alert('Subscribed — watch your inbox!');}}>
      <input type="email" required placeholder="Email for offers" className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm placeholder:text-gray-400 outline-none focus:bg-white/15"/>
      <button className="btn bg-leaf-500 text-white hover:bg-leaf-600 py-2 text-sm">Join</button>
    </form>
  );
}
