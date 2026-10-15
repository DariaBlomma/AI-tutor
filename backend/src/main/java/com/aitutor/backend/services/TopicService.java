package com.aitutor.backend.services;

import com.aitutor.backend.dto.topic.TopicRequest;
import com.aitutor.backend.dto.topic.TopicResponse;
import com.aitutor.backend.entities.Topic;
import com.aitutor.backend.exceptions.ConflictException;
import com.aitutor.backend.exceptions.ResourceNotFoundException;
import com.aitutor.backend.mappers.TopicMapper;
import com.aitutor.backend.repositories.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final TopicMapper topicMapper;

    @Transactional(readOnly = true)
    public List<TopicResponse> getAllTopics() {
        return topicMapper.toResponseList(topicRepository.findAll());
    }

    @Transactional(readOnly = true)
    public TopicResponse getTopicById(Long id) {
        return topicMapper.toResponse(findTopicOrThrow(id));
    }

    @Transactional
    public TopicResponse createTopic(TopicRequest request) {
        String name = request.getName().trim();

        if (topicRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Topic with name '" + name + "' already exists");
        }

        Topic topic = Topic.builder().name(name).build();
        Topic saved = topicRepository.save(topic);

        log.info("Created topic id={} name={}", saved.getId(), saved.getName());
        return topicMapper.toResponse(saved);
    }

    @Transactional
    public TopicResponse updateTopic(Long id, TopicRequest request) {
        Topic topic = findTopicOrThrow(id);
        String name = request.getName().trim();

        Topic existing = topicRepository.findByNameIgnoreCase(name);
        if (existing != null && !existing.getId().equals(id)) {
            throw new ConflictException("Topic with name '" + name + "' already exists");
        }

        topic.setName(name);
        return topicMapper.toResponse(topicRepository.save(topic));
    }

    @Transactional
    public void deleteTopic(Long id) {
        Topic topic = findTopicOrThrow(id);
        topicRepository.delete(topic);
        log.info("Deleted topic id={}", id);
    }

    /** Используется сервисом заданий: вернуть существующую тему или 404. */
    @Transactional(readOnly = true)
    public Topic findTopicOrThrow(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
    }
}