-- Spring Modulith event publication registry (transactional outbox for domain events between modules).
-- Platform table, not tenant data: events carry their own tenant_id inside the payload.
create table event_publication (
    id                      uuid         primary key,
    listener_id             text         not null,
    event_type              text         not null,
    serialized_event        text         not null,
    publication_date        timestamptz  not null,
    completion_date         timestamptz,
    last_resubmission_date  timestamptz,
    completion_attempts     integer      not null default 0,
    status                  varchar(20)
);

create index ix_event_publication_incomplete on event_publication (publication_date) where completion_date is null;
create index ix_event_publication_serialized_event_hash on event_publication using hash (serialized_event);

-- Used only when spring.modulith.events.completion-mode=archive; Hibernate validates it either way.
create table event_publication_archive (
    id                      uuid         primary key,
    listener_id             text         not null,
    event_type              text         not null,
    serialized_event        text         not null,
    publication_date        timestamptz  not null,
    completion_date         timestamptz,
    last_resubmission_date  timestamptz,
    completion_attempts     integer      not null default 0,
    status                  varchar(20)
);
