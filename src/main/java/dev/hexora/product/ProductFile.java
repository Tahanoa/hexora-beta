package dev.hexora.product;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
@Entity @Table(name="product_private_files")
public class ProductFile {
 @Id public Long id;
 @JdbcTypeCode(SqlTypes.VARBINARY) @Column(nullable=false,columnDefinition="bytea") public byte[] data;
}
