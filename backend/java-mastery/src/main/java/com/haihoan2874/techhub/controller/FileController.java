package com.haihoan2874.techhub.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "File Management", description = "Endpoints for serving uploaded files")
public class FileController {

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    @GetMapping("/{folder}/{fileName:.+}")
    @Operation(summary = "Serve uploaded files")
    public ResponseEntity<Resource> getFile(@PathVariable String folder, @PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(folder).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = "application/octet-stream";
                if (fileName.endsWith(".png")) contentType = "image/png";
                else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (fileName.endsWith(".webp")) contentType = "image/webp";
                else if (fileName.endsWith(".gif")) contentType = "image/gif";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            log.error("Could not serve file: {}/{}", folder, fileName, ex);
            return ResponseEntity.internalServerError().build();
        }
    }
}
