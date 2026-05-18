"use client";

import React, { useState, useEffect } from "react";
import PostEditor from "@/components/common/PostEditor";
import MediaGallery from "@/components/common/MediaGallery";



interface Post {
  postId: number;
  title: string;
  content: string;
  tags: any;
  status: string;
  views: number;
  slug?: string;
  thumbnailMediaId?: number | null;
  thumbnailMedia?: any;
  sliderImages?: any[];
  categoryIds?: number[];
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showThumbGallery, setShowThumbGallery] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [showSliderGallery, setShowSliderGallery] = useState(false);
  const [sliderImages, setSliderImages] = useState<any[]>([]);





  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?page=${page}&limit=10`, {
        credentials: 'include'
      });
      if (response.ok) {
        const result = await response.json();
        setPosts(result.data);
        setMeta(result.meta);
        setCurrentPage(result.meta.page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handleThumbSelect = (media: any) => {
    const mediaIdInput = document.getElementById('thumbnailMediaId') as HTMLInputElement;
    if (mediaIdInput) {
      mediaIdInput.value = media.id;
    }
    setThumbPreview(media.urlFull);
    setShowThumbGallery(false);
  };

  const handleSliderSelect = (media: any) => {
    // Add to slider if not already there
    if (!sliderImages.find(img => img.id === media.id)) {
      setSliderImages([...sliderImages, media]);
    }
    setShowSliderGallery(false);
  };

  const handleSliderSelectMultiple = (mediaItems: any[]) => {
    // Merge new selections with existing ones, avoiding duplicates
    const newImages = [...sliderImages];
    mediaItems.forEach(item => {
      if (!newImages.find(img => img.id === item.id)) {
        newImages.push(item);
      }
    });
    setSliderImages(newImages);
    setShowSliderGallery(false);
  };


  const removeSliderImage = (id: number) => {
    setSliderImages(sliderImages.filter(img => img.id !== id));
  };

  const autoSetThumbnail = () => {
    if (sliderImages.length > 0) {
      const firstImg = sliderImages[0];
      setThumbPreview(firstImg.urlFull);
      const mediaIdInput = document.getElementById('thumbnailMediaId') as HTMLInputElement;
      if (mediaIdInput) mediaIdInput.value = firstImg.id;
    }
  };





  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    // Clean up numeric fields
    if (data.thumbnailMediaId === "") {
      data.thumbnailMediaId = null;
    } else if (data.thumbnailMediaId) {
      data.thumbnailMediaId = parseInt(data.thumbnailMediaId);
    }

    // Add slider image IDs
    data.sliderImageIds = sliderImages.map(img => img.id);

    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== "");
    }

    const method = editingPost ? 'PATCH' : 'POST';
    const url = editingPost 
      ? `${process.env.NEXT_PUBLIC_API_URL}/posts/${editingPost.postId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/posts`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (response.ok) {
        setEditingPost(null);
        setIsCreating(false);
        fetchPosts(currentPage);
      } else {
        alert('Failed to save post');
      }
    } catch (err) {
      alert('Error saving post');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) fetchPosts(currentPage);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const startEditing = async (post: Post) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${post.postId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const fullPost = await response.json();
        
        // Reset states first to prevent any leaks
        setThumbPreview(null);
        setPostTitle('');
        setSliderImages([]);
        
        // Load actual fields cleanly
        setEditingPost(fullPost);
        if (fullPost.thumbnailMedia) {
          setThumbPreview(fullPost.thumbnailMedia.urlFull);
        }
        if (fullPost.title) {
          setPostTitle(fullPost.title);
        }
        if (fullPost.sliderImages) {
          setSliderImages(fullPost.sliderImages.map((si: any) => si.media));
        }
      }
    } catch (err) {
      console.error('Failed to load full post details', err);
      // Fallback
      setEditingPost(post);
    }
  };

  const startCreating = () => {
    setEditingPost(null);
    setThumbPreview(null);
    setPostTitle('');
    setSliderImages([]);
    setIsCreating(true);
  };

  if (loading && posts.length === 0) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    if (editingPost || isCreating) {
      const post = editingPost || { title: '', content: '', status: 'Published', tags: [] };



    return (
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-md border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-4xl font-semibold text-gray-800 w-full text-center">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button onClick={() => { 
            setEditingPost(null); 
            setIsCreating(false); 
            setThumbPreview(null); 
            setPostTitle(''); 
            setSliderImages([]);
          }} className="text-gray-400 hover:text-red-500 transition-colors absolute right-12 top-12">



            <span className="material-icons text-3xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Title:</label>
            <input 
              name="title" 
              defaultValue={post.title} 
              onChange={(e) => setPostTitle(e.target.value)}
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded focus:border-blue-500 outline-none transition-all text-gray-700" 
            />

          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Thumbnail:</label>
            <div className="flex items-center gap-4 mb-4">
                {thumbPreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={thumbPreview.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${thumbPreview}` : thumbPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setThumbPreview(null)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <span className="material-icons text-3xl">image</span>
                    <span className="text-[10px] mt-1 uppercase font-bold">No Image</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowThumbGallery(true)}
                    className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 text-sm font-bold"
                  >
                      <span className="material-icons text-sm">collections</span>
                      Browse Gallery
                  </button>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recommended: 1200x630px</span>
                </div>
            </div>





            <input 
              type="hidden" 
              id="thumbnailMediaId" 
              name="thumbnailMediaId" 
              defaultValue={(post as any).thumbnailMediaId || ''} 
            />
          </div>

          {/* Slider Images Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-700">Slider Images (Multiple):</label>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider"> these images will appear in the top slider</p>
              </div>
              <div className="flex gap-2">
                {sliderImages.length > 0 && (
                  <button 
                    type="button" 
                    onClick={autoSetThumbnail}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <span className="material-icons text-sm">auto_awesome</span>
                    Auto Thumbnail
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setShowSliderGallery(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <span className="material-icons text-sm">add_photo_alternate</span>
                  Add to Slider
                </button>
              </div>
            </div>


            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sliderImages.map((img) => (
                <div key={img.id} className="group relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-lg">
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${img.urlThumb}`} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  
                  {/* Delete Button - Prominent top-right */}
                  <button 
                    type="button"
                    onClick={() => removeSliderImage(img.id)}
                    className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 z-10"
                    title="ลบรูปภาพ"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setThumbPreview(img.urlFull);
                        const mediaIdInput = document.getElementById('thumbnailMediaId') as HTMLInputElement;
                        if (mediaIdInput) mediaIdInput.value = img.id;
                      }}
                      className="w-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white py-2 rounded-lg text-[10px] font-extrabold transition-all border border-white/30 tracking-wider shadow-xl active:scale-95"
                    >
                      USE AS THUMBNAIL
                    </button>
                  </div>
                </div>
              ))}
              {sliderImages.length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs italic">
                  No images in slider yet.
                </div>
              )}
            </div>
          </div>

          {showThumbGallery && (
            <MediaGallery isModal={true} onSelect={handleThumbSelect} onClose={() => setShowThumbGallery(false)} />
          )}
          
          {showSliderGallery && (
            <MediaGallery 
              isModal={true} 
              allowMultiple={true}
              onSelectMultiple={handleSliderSelectMultiple} 
              onClose={() => setShowSliderGallery(false)} 
            />
          )}





          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Content:</label>
            <PostEditor 
              content={post.content} 
              postTitle={postTitle}
              onChange={(newContent) => {
                const contentInput = document.getElementById('content-input') as HTMLInputElement;
                if (contentInput) contentInput.value = newContent;
              }} 
            />
            <input type="hidden" id="content-input" name="content" defaultValue={post.content} />
          </div>



          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Status:</label>
              <select name="status" defaultValue={post.status} className="w-full px-4 py-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white">
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-[#007bff] text-white py-4 rounded font-bold text-lg hover:bg-[#0069d9] transition-all shadow-sm active:scale-[0.99]">
            {editingPost ? 'Update Post' : 'Create Post'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="material-icons text-blue-600 text-4xl">article</span>
            Post Management
          </h2>
          <p className="text-gray-500 mt-1">Manage content with pagination and uploads.</p>
        </div>
        <button onClick={startCreating} className="bg-[#007bff] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0069d9] transition-all shadow-md flex items-center gap-2 active:scale-95">
          <span className="material-icons">add</span>
          New Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Content</th>
              <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-5 text-sm font-bold text-gray-600 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.map((post) => (
              <tr key={post.postId} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    {post.thumbnailMedia ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}${post.thumbnailMedia.urlFull}`} alt="" className="w-12 h-12 rounded object-cover border border-gray-200" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined">image_not_supported</span>
                      </div>
                    )}

                    <span className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{post.title}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${post.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center gap-3">
                    <a href={`/posts/${post.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-green-500 hover:bg-green-100 rounded-full transition-all" title="View Post">
                      <span className="material-icons text-2xl">visibility</span>
                    </a>
                    <button onClick={() => startEditing(post)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all" title="Edit Post">
                      <span className="material-icons text-2xl">edit</span>
                    </button>
                    <button onClick={() => handleDelete(post.postId)} className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-all" title="Delete Post">
                      <span className="material-icons text-2xl">delete_outline</span>
                    </button>
                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-100">
            <span className="text-sm text-gray-500">Showing page {meta.page} of {meta.totalPages} (Total {meta.total} posts)</span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === meta.totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
