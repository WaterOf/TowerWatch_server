import cv2
from ultralytics import YOLO
from PIL import Image
import datetime
import sys

model = YOLO("./best.pt")
video = cv2.VideoCapture(
    "rtsp://admin:a8888888@192.168.2.5:554/h264/ch1/main/av_stream"
)
pre_num_id = 0
while video.isOpened():
    success, frame = video.read()
    if success:
        results = model.track(frame, persist=True, verbose=False)
        if results[0].boxes.id is not None:
            if results[0].boxes.id.shape[0] is not pre_num_id:
                current = datetime.datetime.now()
                timestamp = current.timestamp()
                current_date = current.date()
                hour, minute, second = current.hour, current.minute, current.second
                im_array = results[0].plot()
                im = Image.fromarray(im_array[..., ::-1])
                filename = f"warnimg{current_date}_{hour}_{minute}_{second}.jpg"
                img_url = f"./imgs/{filename}"
                im.save(img_url)  # save image

                for j in range(results[0].boxes.shape[0]):
                    center = results[0].boxes.xywh[j][:2]
                    index = int(results[0].boxes.cls[j])

                    warn_type = results[0].names[index]

                    data = {
                        "img_url": filename,
                        "warn_type": warn_type,
                        "centerX": str((center[0].numpy().tolist())),
                        "centerY": str((center[1].numpy().tolist())),
                        "time": str(timestamp),
                    }
                    print(str(data))
                    sys.stdout.flush()

            pre_num_id = results[0].boxes.id.shape[0]

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    else:
        break

video.release()
cv2.destroyAllWindows()
