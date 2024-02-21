import {
  _decorator,
  Component,
  EventMouse,
  input,
  Input,
  Node,
  Vec3,
  Animation,
} from "cc";
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40; // 设置一个放大比

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property(Animation)
  BodyAnim: Animation = null;

  private _startJump: boolean = false; //是否开始跳跃
  private _jumpStep: number = 0; // 跳跃的步数
  private _curJumpTime: number = 0; // 记录当前已跳跃时间
  private _jumpTime: number = 0.1; // 跳跃时间
  private _curJumpSpeed: number = 0; // 记录跳跃时的速度，移动速度
  private _curPos: Vec3 = new Vec3(); // 当前位置
  private _deltaPos: Vec3 = new Vec3(0, 0, 0); // 位移
  private _targetPos: Vec3 = new Vec3(); // 目标位置
  private _curMoveIndex: number = 0; // 角色当前为多少步

  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  update(deltaTime: number) {
    if (this._startJump) {
      this._curJumpTime += deltaTime; // 累计总跳跃时间
      if (this._curJumpTime >= this._jumpTime) {
        // 跳跃时间到了，停止跳跃
        this.node.setPosition(this._targetPos); // 强制位置到终点
        this._startJump = false; // 停止跳跃
        this.onOnceJumpEnd();
      } else {
        this.node.getPosition(this._curPos);
        this._deltaPos.x = this._curJumpSpeed * deltaTime; // 每一帧根据速度和时间计算位移
        // this._deltaPos.y = this._curJumpSpeed * deltaTime; // 每一帧根据速度和时间计算位移
        Vec3.add(this._curPos, this._curPos, this._deltaPos); // 应用这个位移
        this.node.setPosition(this._curPos); // 将位移应用给角色
      }
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      this.jumpByStep(1);
    } else if (event.getButton() === 2) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._startJump) {
      return;
    }
    this._startJump = true;
    this._jumpStep = step;
    this._curJumpTime = 0;
    if (this.BodyAnim) {
      const clipName = step == 1 ? "oneStep" : "twoStep";
      const state = this.BodyAnim.getState(clipName);
      this._jumpTime = state.duration;
    }

    this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime;
    this.node.getPosition(this._curPos); // 获取角色当前位置
    // 计算目标位置
    Vec3.add(
      this._targetPos,
      this._curPos,
      new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
    );

    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play("oneStep");
      } else if (step === 2) {
        this.BodyAnim.play("twoStep");
      }
    }

    this._curMoveIndex += step;
  }

  reset() {
    this._curMoveIndex = 0;
  }

  onOnceJumpEnd() {
    this.node.emit("JumpEnd", this._curMoveIndex);
  }
}
