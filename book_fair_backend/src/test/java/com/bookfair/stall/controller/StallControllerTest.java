package com.bookfair.stall.controller;

import com.bookfair.auth.entity.User;
import com.bookfair.auth.service.UserService;
import com.bookfair.stall.dto.StallCollectionResponse;
import com.bookfair.stall.dto.StallRequest;
import com.bookfair.stall.dto.StallResponse;
import com.bookfair.stall.entity.StallSize;
import com.bookfair.stall.entity.Stall;
import com.bookfair.stall.entity.StallStatus;
import com.bookfair.stall.service.StallHoldService;
import com.bookfair.stall.service.StallService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StallControllerTest {

	@Mock
	private StallService stallService;

	@Mock
	private StallHoldService stallHoldService;

	@Mock
	private UserService userService;

	@InjectMocks
	private StallController controller;

	@Test
	void getStalls_returnsCollection() {
		StallResponse s = StallResponse.builder().id(1L).code("A1").size(StallSize.SMALL).description("d").status(StallStatus.AVAILABLE).reserved(false).build();
		StallCollectionResponse coll = StallCollectionResponse.builder().stall(s).bookedId(2L).inProgressId(3L).build();

		when(stallService.getStalls(false, null)).thenReturn(coll);

		ResponseEntity<StallCollectionResponse> resp = controller.getStalls(false, null);

		assertThat(resp.getStatusCodeValue()).isEqualTo(200);
		assertThat(resp.getBody()).isEqualTo(coll);
	}

	@Test
	void createStall_returnsCreated() {
		StallRequest req = new StallRequest();
		req.setCode("B1");
		req.setSize(StallSize.MEDIUM);
		req.setDescription("desc");

		StallResponse out = StallResponse.builder().id(5L).code("B1").size(StallSize.MEDIUM).description("desc").status(StallStatus.AVAILABLE).reserved(false).build();
		when(stallService.createStall(eq(req))).thenReturn(out);

		ResponseEntity<StallResponse> resp = controller.createStall(req);

		assertThat(resp.getStatusCodeValue()).isEqualTo(200);
		assertThat(resp.getBody()).isEqualTo(out);
	}

	@Test
	void releaseStall_returnsUpdated() {
		StallResponse out = StallResponse.builder().id(7L).code("C1").size(StallSize.LARGE).description("x").status(StallStatus.AVAILABLE).reserved(false).build();
		when(stallService.releaseStall(7L)).thenReturn(out);

		ResponseEntity<StallResponse> resp = controller.releaseStall(7L);

		assertThat(resp.getStatusCodeValue()).isEqualTo(200);
		assertThat(resp.getBody()).isEqualTo(out);
	}

	@Test
	void hold_and_releaseHold_and_releaseAllHolds_behaviour() {
		User user = User.builder().id(11L).email("u@e.com").build();
		when(userService.getCurrentUser()).thenReturn(user);

		when(stallHoldService.hold(10L, user)).thenReturn(Stall.builder().id(10L).code("X").size(StallSize.SMALL).status(StallStatus.IN_PROGRESS).build());
		ResponseEntity<Void> holdResp = controller.holdStall(10L);
		assertThat(holdResp.getStatusCodeValue()).isEqualTo(200);

		doNothing().when(stallHoldService).release(10L, user, false);
		ResponseEntity<Void> releaseResp = controller.releaseHold(10L);
		assertThat(releaseResp.getStatusCodeValue()).isEqualTo(204);

		doNothing().when(stallHoldService).releaseAllForUser(user);
		ResponseEntity<Void> allResp = controller.releaseAllHolds();
		assertThat(allResp.getStatusCodeValue()).isEqualTo(204);
	}
}