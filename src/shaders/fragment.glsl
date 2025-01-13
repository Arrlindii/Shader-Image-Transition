varying vec2 vUv;
uniform float uProgress;
uniform vec2 uSize;
uniform sampler2D uTexture;
#define PI 3.1415926538


float noise(vec2 point) {
    float frequency = 1.0;
    float angle = atan(point.y,point.x) + uProgress * PI;

    float w0 = (cos(angle * frequency) + 1.0) / 2.0; // normalize [0 - 1]
    float w1 = (sin(2.*angle * frequency) + 1.0) / 2.0; // normalize [0 - 1]
    float w2 = (cos(3.*angle * frequency) + 1.0) / 2.0; // normalize [0 - 1]
    float wave = (w0 + w1 + w2) / 3.0; // normalize [0 - 1]
    return wave;
}

float softMax(float a, float b, float k) {
    return log(exp(k * a) + exp(k * b)) / k;
}

float softMin(float a, float b, float k) {
    return -softMax(-a, -b, k);
}

float circleSDF(vec2 pos, float rad) {
    float a = sin(uProgress * 0.2) * 0.25; // range -0.25 - 0.25
    float amt = 0.5 + a;
    float circle = length(pos);
    circle += noise(pos) * rad * amt;
    return circle;
}

float radialCircles(vec2 p, float o, float count) {
    vec2 offset = vec2(o, o);

    float angle = (2. * PI)/count;
    float s = round(atan(p.y, p.x)/angle);
    float an = angle * s;
    vec2 q = vec2(offset.x * cos(an), offset.y * sin(an));
    vec2 pos = p - q;
    float circle = circleSDF(pos, 15.0);
    return circle;
}

void main() {
    vec4 bg = vec4(vec3(0.0), 0.0);
    vec4 texture = texture2D(uTexture,vUv);
    vec2 coords = vUv * uSize;
    vec2 o1 = vec2(0.5) * uSize;

    float t = pow(uProgress, 2.5); // easing
    float radius = uSize.x / 2.0;
    float rad = t * radius;
    float c1 = circleSDF(coords - o1, rad);

    vec2 p = (vUv - 0.5) * uSize;
    float r1 = radialCircles(p, 0.2 * uSize.x, 3.0);
    float r2 = radialCircles(p, 0.25 * uSize.x, 3.0);
    float r3 = radialCircles(p, 0.45 * uSize.x, 5.0);

    float k = 50.0 / uSize.x;
    float circle = softMin(c1, r1, k); 
    circle = softMin(circle, r2, k);
    circle = softMin(circle, r3, k);

    circle = step(circle, rad);
    vec4 color = mix(bg, texture, circle);
    gl_FragColor = color;
}