package com.haihoan2874.techhub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(@Value("${cloudinary.url:}") String cloudinaryUrl) {
        if (StringUtils.hasText(cloudinaryUrl)) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
            log.info("Cloudinary configured via properties.");
        } else {
            // Fallback to the exact keys provided by user if environment variable is somehow missing
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", "dehjudquq",
                    "api_key", "646328442268764",
                    "api_secret", "bgLwkJcnmcT4tgbDw7W5bZBeMR8"));
            log.warn("Cloudinary fallback configuration used.");
        }
    }

    /**
     * Store file in Cloudinary within a specific sub-folder
     * @param file The file to store
     * @param subFolder Sub-folder name (e.g., "products", "brands", "avatars")
     * @return The absolute URL to access the file from Cloudinary
     */
    public String storeFile(MultipartFile file, String subFolder) {
        // Clean subFolder name
        String cleanSubFolder = StringUtils.cleanPath(subFolder).replaceAll("[^a-zA-Z0-9/]", "");

        try {
            String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String fileExtension = "";
            
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            }
            
            // Security check for image extensions
            if (!isImageExtension(fileExtension)) {
                throw new RuntimeException("Only image files are allowed! (jpg, png, webp, jpeg)");
            }

            // Generate unique file name
            String fileName = UUID.randomUUID().toString();

            // Upload to Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "slife/" + cleanSubFolder,
                    "public_id", fileName
            ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("File stored successfully on Cloudinary: {}", secureUrl);

            return secureUrl;
        } catch (IOException ex) {
            log.error("Could not store file to Cloudinary in folder {}. Please try again!", cleanSubFolder, ex);
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    private boolean isImageExtension(String extension) {
        return extension.equals(".jpg") || extension.equals(".png") || 
               extension.equals(".webp") || extension.equals(".jpeg") || extension.equals(".gif");
    }
}
