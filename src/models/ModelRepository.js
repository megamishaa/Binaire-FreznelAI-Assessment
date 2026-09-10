import { ModelApi } from "../api/ModelApi";
import { Model } from "./Model";

export class ModelRepository {
  constructor() {
    this.api = new ModelApi();
  }

  loadModels() {
    return this.api.fetchModels().then((data) => {
      return data.map((model) => new Model(model));
    });
  }
}
