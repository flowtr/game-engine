import { Matrix4x4 } from "../../Math";
import { Material } from "../../Graphics/Material";
import { BuiltinShader, Shader } from "./Shader";

/**
 * A basic shader that can be used for 2D games.
 */
export class BasicColorShader extends Shader {
    public constructor() {
        super(BuiltinShader.COLOR);

        this.load(this.getVertexSource(), this.getFragmentSource());
    }

    public ApplyStandardUniforms(
        material: Material,
        model: Matrix4x4,
        view: Matrix4x4,
        projection: Matrix4x4
    ): void {
        this.use();
        this.SetUniformMatrix4x4("u_model", model);
        this.SetUniformMatrix4x4("u_view", view);
        this.SetUniformMatrix4x4("u_projection", projection);
        this.SetUniformColor("u_tint", material.tint);
    }

    private getVertexSource(): string {
        return `
attribute vec3 a_position;

uniform mat4 u_view;
uniform mat4 u_model;
uniform mat4 u_projection;

varying vec3 v_fragPosition;

void main() {
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
    v_fragPosition = vec3(u_model * vec4(a_position, 1.0));
}`;
    }

    private getFragmentSource(): string {
        return `
precision mediump float;

uniform vec4 u_tint;

void main() {
    gl_FragColor = u_tint;
}
`;
    }
}
