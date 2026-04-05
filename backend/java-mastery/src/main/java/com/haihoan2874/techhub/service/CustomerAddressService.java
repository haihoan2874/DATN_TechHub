package com.haihoan2874.techhub.service;

import com.haihoan2874.techhub.dto.request.CreateCustomerAddressRequest;
import com.haihoan2874.techhub.dto.response.CreateCustomerAddressResponse;
import com.haihoan2874.techhub.dto.request.UpdateCustomerAddressRequest;
import com.haihoan2874.techhub.dto.response.UpdateCustomerAddressResponse;
import com.haihoan2874.techhub.dto.response.GetDetailCustomerAddressResponse;
import com.haihoan2874.techhub.dto.response.GetListCustomerAddressResponse;
import com.haihoan2874.techhub.dto.response.SetDefaultAddressResponse;
import com.haihoan2874.techhub.dto.request.base.BaseCustomerAddressRequest;
import com.haihoan2874.techhub.model.CustomerAddress;
import com.haihoan2874.techhub.repository.CustomerAddressRepository;
import com.haihoan2874.techhub.security.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerAddressService {
    private final CustomerAddressRepository customerAddressRepository;
    private final UserService userService;

    @Transactional
    public CreateCustomerAddressResponse createCustomerAddress(CreateCustomerAddressRequest request, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Creating new customer address for user id {} ", userId);

        boolean isDefault = handleDefaultAddress(userId, request.getIsDefault());

        CustomerAddress customerAddress = new CustomerAddress();
        mapRequestToEntity(customerAddress, request);

        customerAddress.setUserId(userId);
        customerAddress.setIsDefault(isDefault);

        CustomerAddress savedAddress = customerAddressRepository.saveAndFlush(customerAddress);
        log.info("Saved address for user id {} ", userId);

        return CreateCustomerAddressResponse.builder()
                .id(savedAddress.getId())
                .userId(savedAddress.getUserId())
                .fullName(savedAddress.getFullName())
                .phone(savedAddress.getPhone())
                .address(savedAddress.getAddress())
                .city(savedAddress.getCity())
                .postalCode(savedAddress.getPostalCode())
                .isDefault(savedAddress.getIsDefault())
                .createdAt(savedAddress.getCreatedAt())
                .build();
    }

    public List<GetListCustomerAddressResponse> getMyAddresses(Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        List<CustomerAddress> addresses = customerAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);

        return addresses.stream()
                .map(address -> GetListCustomerAddressResponse.builder()
                        .id(address.getId())
                        .fullName(address.getFullName())
                        .phone(address.getPhone())
                        .address(address.getAddress())
                        .city(address.getCity())
                        .postalCode(address.getPostalCode())
                        .isDefault(address.getIsDefault())
                        .createdAt(address.getCreatedAt())
                        .build()).toList();
    }

    public GetDetailCustomerAddressResponse getAddressById(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Getting address id {} for user id {} ", id, userId);

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Customer address not found"));
        return GetDetailCustomerAddressResponse.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .address(address.getAddress())
                .city(address.getCity())
                .postalCode(address.getPostalCode())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }

    @Transactional
    public SetDefaultAddressResponse setDefaultAddress(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Address not found with id: " + id));

        customerAddressRepository.resetDefaultAddressForUser(userId);

        address.setIsDefault(true);
        CustomerAddress savedAddress = customerAddressRepository.save(address);

        return SetDefaultAddressResponse.builder()
                .id(savedAddress.getId())
                .isDefault(true)
                .updatedAt(savedAddress.getUpdatedAt())
                .build();
    }

    @Transactional
    public UpdateCustomerAddressResponse updateCustomerAddress(UUID id, UpdateCustomerAddressRequest request, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Updating customer address for user id {} ", userId);

        CustomerAddress address = customerAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Customer address not found"));
        boolean isDefault = handleDefaultAddress(userId, request.getIsDefault());

        mapRequestToEntity(address, request);
        address.setIsDefault(isDefault);

        CustomerAddress savedAddress = customerAddressRepository.saveAndFlush(address);

        return UpdateCustomerAddressResponse.builder()
                .id(savedAddress.getId())
                .userId(savedAddress.getUserId())
                .fullName(savedAddress.getFullName())
                .phone(savedAddress.getPhone())
                .address(savedAddress.getAddress())
                .city(savedAddress.getCity())
                .postalCode(savedAddress.getPostalCode())
                .isDefault(savedAddress.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }

    public void deleteCustomerAddress(UUID id, Authentication authentication) {
        UUID userId = userService.getCurrentUserId(authentication);
        log.info("Deleting customer address with id {} for user {} ", id, userId);

        customerAddressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Customer address not found"));

        customerAddressRepository.deleteById(id);
    }

    private void mapRequestToEntity(CustomerAddress customerAddress, BaseCustomerAddressRequest request) {
        customerAddress.setFullName(request.getFullName());
        customerAddress.setPhone(request.getPhone());
        customerAddress.setAddress(request.getAddress());
        customerAddress.setCity(request.getCity());
        customerAddress.setPostalCode(request.getPostalCode());
    }

    private boolean handleDefaultAddress(UUID userId, Boolean requestDefault) {
        long addressCount = customerAddressRepository.countByUserId(userId);

        if (addressCount == 0) {
            return true; // First address is always default
        }

        boolean isDefault = Boolean.TRUE.equals(requestDefault);
        if (isDefault) {
            customerAddressRepository.resetDefaultAddressForUser(userId);
        }

        return isDefault;
    }
}



