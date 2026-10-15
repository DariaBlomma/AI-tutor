package com.aitutor.backend.mappers;

import com.aitutor.backend.dto.topic.TopicRequest;
import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.entities.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TopicMapper {

    Topic toEntity(TopicRequest request);

    TopicResponse toResponse(Topic topic);

    List<TopicResponse> toResponseList(List<Topic> topics);
}