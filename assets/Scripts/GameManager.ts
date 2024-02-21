import {
  _decorator,
  CCInteger,
  Component,
  instantiate,
  Label,
  Node,
  Prefab,
  Vec3,
} from "cc";
import { BLOCK_SIZE, PlayerController } from "./PlayController";
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE,
}

enum GameState {
  GS_INIT,
  GS_END,
  GS_PLAYING,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Node })
  public startMenu: Node | null = null; // 开始ui

  @property({ type: PlayerController })
  public playerController: PlayerController | null = null; // 角色控制器

  @property({ type: Label })
  public stepsLabel: Label | null = null; // 计步器

  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null;

  @property({ type: CCInteger })
  public roadLength: number = 50;

  public _road: BlockType[] = [];

  start() {
    this.setCurState(GameState.GS_INIT); // 第一初始化要在 start 里面调用
    this.playerController?.node.on("JumpEnd", this.onPlayerJumpEnd, this);
  }

  init() {
    if (this.startMenu) {
      // 开始菜单是否显示
      this.startMenu.active = true;
    }

    this.generateRoad();

    if (this.playerController) {
      this.playerController.setInputActive(false); //开始菜单时无法控制角色
      this.playerController.node.setPosition(Vec3.ZERO); // 重制玩家位置
      this.playerController.reset();
      // this.playerController.resetInEditor();
    }
  }

  update(deltaTime: number) {}

  generateRoad() {
    console.log("g road doing");
    this.node.removeAllChildren();

    this._road = [];

    this._road.push(BlockType.BT_STONE);

    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        this._road.push(Math.floor(Math.random() * 2));
      }
    }

    for (let j = 0; j < this._road.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._road[j]);
      if (block) {
        this.node.addChild(block);
        block.setPosition(j * BLOCK_SIZE, 0, 0);
      }
    }
  }

  spawnBlockByType(type: BlockType): Node | null {
    if (!this.boxPrefab) {
      return null;
    }

    if (type === BlockType.BT_NONE) {
      return null;
    } else if (type === BlockType.BT_STONE) {
      return instantiate(this.boxPrefab);
    }
  }

  setCurState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:
        if (this.startMenu) {
          this.startMenu.active = false;
        }

        if (this.stepsLabel) {
          this.stepsLabel.string = "0"; // 将步数重置为0
        }

        setTimeout(() => {
          //直接设置active会直接开始监听鼠标事件，做了一下延迟处理
          if (this.playerController) {
            this.playerController.setInputActive(true);
          }
        }, 0.1);
        break;
      case GameState.GS_END:
        break;
    }
  }

  onStartBtnClick() {
    this.setCurState(GameState.GS_PLAYING);
  }

  onPlayerJumpEnd(moveIndex: number) {
    this.stepsLabel.string = moveIndex + "";
  }
}
