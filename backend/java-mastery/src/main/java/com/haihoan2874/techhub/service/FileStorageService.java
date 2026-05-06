package com.haihoan2874.techhub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path baseStorageLocation;

    public FileStorageService() {
        // Base storage in project root /uploads
        this.baseStorageLocation = Paths.get("uploads")
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.baseStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create the base directory for uploads.", ex);
        }
    }

    /**
     * Store file in a specific sub-folder
     * @param file The file to store
     * @param subFolder Sub-folder name (e.g., "products", "brands", "avatars")
     * @return The relative URL to access the file
     */
    public String storeFile(MultipartFile file, String subFolder) {
        // Clean subFolder name
        String cleanSubFolder = StringUtils.cleanPath(subFolder).replaceAll("[^a-zA-Z0-9/]", "");
        Path targetDir = this.baseStorageLocation.resolve(cleanSubFolder);

        try {
            // Ensure target sub-folder exists
            Files.createDirectories(targetDir);

            // Normalize file name
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
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Copy file to the target location
            Path targetLocation = targetDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("File stored successfully: {}/{}", cleanSubFolder, fileName);

            // Return relative path for URL
            return "/api/v1/files/" + cleanSubFolder + "/" + fileName;
        } catch (IOException ex) {
            log.error("Could not store file in {}. Please try again!", cleanSubFolder, ex);
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }

    private boolean isImageExtension(String extension) {
        return extension.equals(".jpg") || extension.equals(".png") || 
               extension.equals(".webp") || extension.equals(".jpeg") || extension.equals(".gif");
    }
}
