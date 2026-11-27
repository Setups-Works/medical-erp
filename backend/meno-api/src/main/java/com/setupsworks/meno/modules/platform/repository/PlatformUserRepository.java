package com.setupsworks.meno.modules.platform.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.setupsworks.meno.modules.platform.domain.PlatformUser;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlatformUserRepository extends JpaRepository<PlatformUser, UUID> {

    Optional<PlatformUser> findByEmail(String email);

    @Query(value = "select permission_code from platform_user_permission where user_id = :userId order by 1",
            nativeQuery = true)
    List<String> permissionsOf(@Param("userId") UUID userId);

    /** Gives a staff member every platform permission (the first admin, from the bootstrap). */
    @Modifying
    @Query(value = """
            insert into platform_user_permission (user_id, permission_code)
            select :userId, code from platform_permission on conflict do nothing""", nativeQuery = true)
    void grantAll(@Param("userId") UUID userId);

    @Query(value = "select full_name from platform_user where id = :id", nativeQuery = true)
    Optional<String> nameOf(@Param("id") UUID id);
}
