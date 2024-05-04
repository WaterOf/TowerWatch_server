CREATE TABLE `camera_list`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `tenant_id` binary(1) NULL DEFAULT NULL,
  `camera_type_id` int NULL DEFAULT NULL COMMENT '摄像头类型',
  `is_online` int NULL DEFAULT NULL COMMENT '是否在线',
  `rtsp_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '视频流地址',
  `district_id` int NULL DEFAULT NULL COMMENT '地区ID',
  `time` datetime NULL DEFAULT NULL COMMENT '时间',
  `warn_amount` bigint NULL DEFAULT NULL COMMENT '预警次数',
  `lon` decimal(15, 10) NULL DEFAULT NULL COMMENT '经度',
  `lat` decimal(15, 10) NULL DEFAULT NULL COMMENT '纬度',
  `detailed_address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '详细地址',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

CREATE TABLE `handle_msg`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '索引',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '处理人姓名',
  `detail` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NULL COMMENT '详细信息',
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '图片地址',
  `tenant_id` binary(1) NULL DEFAULT NULL COMMENT '租户id',
  `time` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

CREATE TABLE `warn_msg`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '告警信息id',
  `warnmsg_type_id` int NULL DEFAULT NULL COMMENT '告警类型',
  `img_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '抓拍图片地址',
  `rtsp_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'rtsp流地址',
  `cenlon` float(255, 6) NULL DEFAULT NULL COMMENT '中心点经度',
  `cenlat` float(255, 6) NULL DEFAULT NULL COMMENT '中心点纬度',
  `is_fixed` int NULL DEFAULT NULL COMMENT '是否处理',
  `handle_time` datetime NULL DEFAULT NULL COMMENT '处理时间',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '处理情况描述',
  `tenant_id` binary(1) NULL DEFAULT NULL COMMENT '租户id',
  `warn_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '抓拍时间',
  `region_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '地块类型',
  PRIMARY KEY (`id` DESC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 33 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

