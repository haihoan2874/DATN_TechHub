package com.haihoan2874.techhub.security.mapper;

import com.haihoan2874.techhub.model.User;
import com.haihoan2874.techhub.security.dto.RegistrationRequest;
import com.haihoan2874.techhub.security.dto.RegistrationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * MapStruct mapper for User entity and DTOs.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Map User entity to RegistrationResponse DTO.
     *
     * @param user the user entity
     * @return the registration response DTO
     */
    RegistrationResponse userToRegistrationResponse(User user);

    /**
     * Map RegistrationRequest DTO to User entity.
     * Ignores fields that are set later by the service layer.
     *
     * @param registrationRequest the registration request DTO
     * @return the user entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "resetOtp", ignore = true)
    @Mapping(target = "resetOtpExpiry", ignore = true)
    User registrationRequestToUser(RegistrationRequest registrationRequest);
}

