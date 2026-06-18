package com.integrador.marweld;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"app.security.jwt.expiration-ms=3600000",
		"app.storage.cloudflare.bucket-name=marweld-test-bucket",
		"app.storage.cloudflare.endpoint=https://mock-account-id.r2.cloudflarestorage.com",
		"app.storage.cloudflare.access-key=mock-access-key",
		"app.storage.cloudflare.secret-key=mock-secret-key",
		"app.storage.cloudflare.signed-url-ttl-seconds=900"
})
class MarweldApplicationTests {

	@Test
	void contextLoads() {
	}

}
