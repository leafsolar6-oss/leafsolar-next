import Image from 'next/image';
import type { AdminProduct } from '@/lib/admin-data';
import { saveProductAction } from '@/app/admin/(dashboard)/actions';

const categoryOptions = [
  'Televisions', 'Audio & Sound', 'Fridges & Freezers', 'Air Conditioners',
  'Washers & Dryers', 'Kitchen & Cooking', 'Fans & Coolers', 'Water & Dispensers',
  'Solar Panels', 'Solar Batteries', 'Inverters', 'Generators & Power',
  'Monitors', 'Tubular Solar', 'Lithium Solar', 'Commercial Solar', 'Industrial Solar',
];

function FieldLabel({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) {
  return <span className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[.1em] text-gray-500">{children}{optional && <i className="text-[9px] font-semibold normal-case tracking-normal text-gray-400">Optional</i>}</span>;
}

export default function ProductForm({ product }: { product?: AdminProduct | null }) {
  const input = 'h-12 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100';
  return (
    <form action={saveProductAction} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {product && <input type="hidden" name="productId" value={product.id} />}
      <input type="hidden" name="existingImage" value={product?.imageUrl || ''} />
      <input type="hidden" name="existingGallery" value={JSON.stringify(product?.galleryUrls || [])} />

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div><p className="text-[10px] font-black uppercase tracking-[.14em] text-leaf-700">Catalogue details</p><h2 className="mt-1 font-display text-xl font-black">Product information</h2></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><FieldLabel>Product name</FieldLabel><input name="name" defaultValue={product?.name} required maxLength={180} className={input} placeholder="e.g. Hisense 55-inch QLED Smart TV" /></label>
            <label><FieldLabel>SKU</FieldLabel><input name="sku" defaultValue={product?.sku} maxLength={80} className={input} placeholder="LS-TV-055" /></label>
            <label><FieldLabel>Brand</FieldLabel><input name="brand" defaultValue={product?.brand || 'Leaf Solar'} required maxLength={80} className={input} placeholder="Hisense" /></label>
            <label><FieldLabel>Department</FieldLabel><select name="department" defaultValue={product?.department || 'electronics'} className={input}><option value="electronics">Electronics & appliances</option><option value="solar">Solar equipment</option><option value="packages">Solar packages</option></select></label>
            <label><FieldLabel>Storefront category</FieldLabel><input name="categoryLabel" list="category-labels" defaultValue={product?.categoryLabel} required className={input} placeholder="Televisions" /><datalist id="category-labels">{categoryOptions.map(option => <option key={option}>{option}</option>)}</datalist></label>
            <label><FieldLabel>Internal category</FieldLabel><input name="category" defaultValue={product?.category || product?.categoryLabel} required maxLength={100} className={input} placeholder="TVs" /></label>
            <label><FieldLabel optional>URL slug</FieldLabel><input name="slug" defaultValue={product?.slug} maxLength={100} className={input} placeholder="Generated from product name" /></label>
            <label className="sm:col-span-2"><FieldLabel>Description</FieldLabel><textarea name="description" defaultValue={product?.description} required minLength={10} maxLength={5000} rows={6} className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" placeholder="Add only confirmed product details, specifications and applicable warranty information." /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-leaf-700">Specifications</p><h2 className="mt-1 font-display text-xl font-black">Verified product details</h2>
          <p className="mt-2 text-xs leading-5 text-gray-500">Only enter details confirmed by the manufacturer or supplier. Use one <b>Name: Value</b> pair per line.</p>
          <label className="mt-5 block"><FieldLabel optional>Specification rows</FieldLabel><textarea name="specifications" defaultValue={product?.specifications.map(item => `${item.name}: ${item.value}`).join('\n')} rows={8} className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 font-mono text-sm leading-6 outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" placeholder={'Screen size: 55 inches\nModel: Confirmed model number\nPower input: Confirmed manufacturer value'} /></label>
          <p className="mt-2 text-[10px] text-gray-400">Up to 30 rows. Leave blank when verified details are not available.</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-leaf-700">Pricing</p><h2 className="mt-1 font-display text-xl font-black">Regular price</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label><FieldLabel>Price in naira</FieldLabel><div className="relative"><span className="absolute left-3.5 top-3 text-sm font-black text-gray-400">₦</span><input name="basePrice" type="number" min="1" step="1" defaultValue={product?.basePrice} required className={`${input} pl-8`} /></div></label>
            <label><FieldLabel optional>Previous price</FieldLabel><div className="relative"><span className="absolute left-3.5 top-3 text-sm font-black text-gray-400">₦</span><input name="compareAtPrice" type="number" min="1" step="1" defaultValue={product?.compareAtPrice || ''} className={`${input} pl-8`} placeholder="For a permanent markdown" /></div></label>
          </div>
          <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">Use Offers for temporary scheduled discounts. “Previous price” is only for a permanent crossed-out comparison price.</p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-leaf-700">Hybrid inventory</p><h2 className="mt-1 font-display text-xl font-black">Availability and stock</h2>
          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4"><input name="trackInventory" type="checkbox" defaultChecked={product?.trackInventory || false} className="mt-0.5 h-5 w-5 accent-leaf-700" /><span><b className="block text-sm">Track exact quantity</b><span className="mt-1 block text-xs leading-5 text-gray-500">Enable for stocked appliances and components. Leave off for made-to-order packages or supplier-available items.</span></span></label>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label><FieldLabel>Quantity on hand</FieldLabel><input name="stockQuantity" type="number" min="0" step="1" defaultValue={product?.stockQuantity ?? 0} className={input} /></label>
            <label><FieldLabel>Low-stock warning at</FieldLabel><input name="lowStockThreshold" type="number" min="0" step="1" defaultValue={product?.lowStockThreshold ?? 2} className={input} /></label>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl bg-gray-50 p-4"><input name="manualInStock" type="checkbox" defaultChecked={product ? product.manualInStock : true} className="h-5 w-5 accent-leaf-700" /><span className="text-sm font-bold">Available for order when exact tracking is off</span></label>
        </section>
      </div>

      <div className="space-y-6 xl:sticky xl:top-9 xl:self-start">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-leaf-700">Product image</p>
          <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-[#f5f6f2]">
            {product?.imageUrl ? <Image src={product.imageUrl} alt="" fill sizes="320px" className="object-contain p-5" /> : <div className="grid h-full place-items-center px-6 text-center text-xs font-bold text-gray-400">Image preview appears after saving</div>}
          </div>
          <label className="mt-4 block"><FieldLabel optional={Boolean(product)}>Upload JPG, PNG or WebP</FieldLabel><input name="imageFile" type="file" accept="image/jpeg,image/png,image/webp" required={!product} className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-leaf-50 file:px-3 file:py-2.5 file:text-xs file:font-extrabold file:text-leaf-800" /></label>
          <p className="mt-2 text-[10px] text-gray-400">Maximum 4 MB. Square images with a clean background work best.</p>
          <label className="mt-4 block"><FieldLabel optional>Image description</FieldLabel><input name="imageAlt" defaultValue={product?.imageAlt} maxLength={220} className={input} placeholder="Defaults to product name" /></label>
          <div className="mt-5 border-t border-gray-100 pt-5">
            <FieldLabel optional>Additional gallery images</FieldLabel>
            {Boolean(product?.galleryUrls.length) && <div className="mb-3 grid grid-cols-4 gap-2">{product!.galleryUrls.map((url, index) => <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50"><Image src={url} alt={`${product!.name} gallery image ${index + 1}`} fill sizes="72px" className="object-contain p-1" /></div>)}</div>}
            <input name="galleryFiles" type="file" multiple accept="image/jpeg,image/png,image/webp" className="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-leaf-50 file:px-3 file:py-2.5 file:text-xs file:font-extrabold file:text-leaf-800" />
            <p className="mt-2 text-[10px] leading-4 text-gray-400">Add up to eight extra images total. Each must be 4 MB or smaller.</p>
            {Boolean(product?.galleryUrls.length) && <label className="mt-3 flex items-center gap-2 text-xs font-bold text-red-700"><input name="clearGallery" type="checkbox" className="h-4 w-4 accent-red-700" /> Remove all existing gallery images when saving</label>}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-black">Store visibility</h2>
          <label className="mt-4 flex cursor-pointer items-center gap-3"><input name="isActive" type="checkbox" defaultChecked={product ? product.isActive : true} className="h-5 w-5 accent-leaf-700" /><span><b className="block text-sm">Published</b><small className="text-gray-400">Visible and purchasable in the store</small></span></label>
          <label className="mt-4 flex cursor-pointer items-center gap-3"><input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured || false} className="h-5 w-5 accent-leaf-700" /><span><b className="block text-sm">Feature on homepage</b><small className="text-gray-400">Marks this product for storefront featuring</small></span></label>
          <button type="submit" className="btn btn-primary mt-6 h-14 w-full rounded-xl">{product ? 'Save product changes' : 'Add product to store'}</button>
        </section>
      </div>
    </form>
  );
}
