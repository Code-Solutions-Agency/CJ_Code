import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fbf7f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            border: "2px solid #1c4694",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            padding: 2,
            gap: 2,
          }}
        >
          <div style={{ height: 2, background: "#1c4694", width: "100%" }} />
          <div style={{ display: "flex", gap: 2 }}>
            <div style={{ width: 3, height: 3, background: "#8fa38a" }} />
            <div style={{ width: 3, height: 3, background: "#1c4694" }} />
            <div style={{ width: 3, height: 3, background: "#8fa38a" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
