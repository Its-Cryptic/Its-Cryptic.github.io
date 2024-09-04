#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float random2D (vec2 st) {
    return fract(sin(dot(st.xy,
    vec2(12.9898,78.233)))*
    43758.5453123);
}

float noise2D(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random2D(i);
    float b = random2D(i + vec2(1.0, 0.0));
    float c = random2D(i + vec2(0.0, 1.0));
    float d = random2D(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
    (c - a)* u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

float fbm2D(vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < 3; i++) {
        value += amplitude * noise2D(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

float domainWarp(vec2 st) {
    vec2 offset = vec2(fbm2D(st), fbm2D(st));
    return fbm2D(st + offset);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord / u_resolution.xy;

    // Time-based variables for smooth animation
    float t = u_time * 1.5;
    float t1 = sin(t) * 0.5 + 0.5;
    float t2 = cos(t) * 0.5 + 0.5;

    float noise = domainWarp(domainWarp(uv) + uv);

    // Color components
    float r = noise*sin(2.0 * uv.x + t1) * 0.5 + 0.5;
    float g = cos(3.0 * uv.y + t2) * 0.5 + 0.5;
    float b = sin(4.0 * (uv.x + uv.y) + t1 + t2) * 0.5 + 0.5;

    // Output the final color
    //fragColor = vec4(r, g, b, 1.0);
    fragColor = vec4(
        0.0*domainWarp(domainWarp(uv) + uv + t),
        domainWarp(domainWarp(uv) + uv + 25.0 - t),
        domainWarp(domainWarp(uv) + uv + 50.0 - t),
        1.0
    );
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}