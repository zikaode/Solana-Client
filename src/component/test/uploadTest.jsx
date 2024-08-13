import { createSignal } from "solid-js";

function ImageUpload() {
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [uploading, setUploading] = createSignal(false);
  const [imageUrl, setImageUrl] = createSignal("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile()) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile());

    try {
      const response = await fetch(
        "https://evoting-server.vercel.app/upload/",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        setImageUrl(data.imageUrl);
      } else {
        console.error("Failed to upload image:", data.message);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={uploading()}>
        Upload
      </button>
      {uploading() && <p>Uploading...</p>}
      {imageUrl() && (
        <div>
          <p>Upload successful! Image URL:</p>
          <img src={imageUrl()} alt="Uploaded Image" />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
