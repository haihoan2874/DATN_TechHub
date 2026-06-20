from PIL import Image

def crop_transparent(image_path, output_path):
    img = Image.open(image_path)
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        img_cropped = img.crop(bbox)
        # Tạo thêm một bản resize 64x64 cho favicon nếu cần, hoặc cứ để nguyên rồi CSS/trình duyệt tự scale
        img_cropped.save(output_path)
        print("Cropped successfully to", output_path)
    else:
        print("Image is empty or fully transparent")

crop_transparent('frontend/public/logo_transparent.png', 'frontend/public/favicon_cropped.png')
