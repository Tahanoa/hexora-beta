package dev.hexora.service;
import dev.hexora.api.ApiException;
import dev.hexora.model.BaseEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.function.*;
@Transactional
public abstract class CrudService<E extends BaseEntity, Q, R> {
 protected final JpaRepository<E,Long> repository;
 private final Supplier<E> factory;
 protected CrudService(JpaRepository<E,Long> repository, Supplier<E> factory) { this.repository=repository; this.factory=factory; }
 protected abstract void apply(Q request,E entity);
 public abstract R view(E entity);
 protected E required(Long id) { return repository.findById(id).orElseThrow(ApiException::notFound); }
 public R create(Q request) { E entity=factory.get();apply(request,entity);return view(repository.saveAndFlush(entity)); }
 public R update(Long id,Q request) { E entity=required(id);apply(request,entity);return view(repository.saveAndFlush(entity)); }
 public void delete(Long id) { repository.delete(required(id));repository.flush(); }
 @Transactional(readOnly=true) public R find(Long id) { return view(required(id)); }
 @Transactional(readOnly=true) public List<R> all(Sort sort) { return repository.findAll(sort).stream().map(this::view).toList(); }
 @Transactional(readOnly=true) public Page<R> page(Pageable pageable) { return repository.findAll(pageable).map(this::view); }
}
