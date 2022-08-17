// FRAGMENT SHADER

varying vec3 vertexNormal;
void main() {

	float intensity = pow(0.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 0.5);

	gl_FragColor = vec4(0.4, 0.6, 1.0, 1.0) * intensity;
}

// VERTEX SHADER

varying vec3 vertexNormal;

void main() {

	vertexNormal = normalize(normalMatrix * normal);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 0.93);
}

// FRAGMENT SHADER

uniform sampler2D globeTexture;
varying vec2 vertexUV;
varying vec3 vertexNormal;
void main() {

	float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));

	vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);

	gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUV).xyz, 1.0);
}

// VERTEX SHADER

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
	vertexUV = uv;
	vertexNormal = normalize(normalMatrix * normal);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
