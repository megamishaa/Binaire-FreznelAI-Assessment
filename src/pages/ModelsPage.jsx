import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Divider,
  Flex,
  Heading,
  Item,
  Picker,
  ProgressCircle,
  SearchField,
  NumberField,
  Text,
  View,
} from "@adobe/react-spectrum";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { ModelRepository } from "../models/ModelRepository";

const repository = new ModelRepository();

export function ModelsPage() {
  const navigate = useNavigate();
  const { authService } = useAuth();

  const [models, setModels] = useState([]);
  const [source, setSource] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [pipeline, setPipeline] = useState("");
  const [family, setFamily] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [weight, setWeight] = useState("");

  const [minFiles, setMinFiles] = useState(undefined);
  const [maxFiles, setMaxFiles] = useState(undefined);

  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    repository
      .loadModels()
      .then((result) => {
        console.log("Models loaded from:", result.source);

        setModels(result.models);
        setSource(result.source);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => {
    const pipelines = [
      ...new Set(
        models
          .map((model) => model.pipelineTag)
          .filter((value) => value && value !== "Unknown"),
      ),
    ].sort();

    const families = [
      ...new Set(
        models
          .map((model) => model.family)
          .filter((value) => value && value !== "Unknown"),
      ),
    ].sort();

    const architectures = [
      ...new Set(models.flatMap((model) => model.architectureTags || [])),
    ].sort();

    const weights = [
      ...new Set(models.flatMap((model) => model.weightTags || [])),
    ].sort();

    return {
      pipelines,
      families,
      architectures,
      weights,
    };
  }, [models]);

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = models.filter((model) => {
      if (query) {
        const searchableText = [
          model.name,
          model.id,
          model.family,
          model.architectureCategory,
          model.weightFormat,
          model.pipelineTag,
          ...(model.architectureTags || []),
          ...(model.weightTags || []),
          ...(model.allTags || []),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      if (pipeline && model.pipelineTag !== pipeline) {
        return false;
      }

      if (family && model.family !== family) {
        return false;
      }

      if (
        architecture &&
        !(model.architectureTags || []).includes(architecture)
      ) {
        return false;
      }

      if (weight && !(model.weightTags || []).includes(weight)) {
        return false;
      }

      if (minFiles !== undefined && model.safetensorFileCount < minFiles) {
        return false;
      }

      if (maxFiles !== undefined && model.safetensorFileCount > maxFiles) {
        return false;
      }

      return true;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      }

      if (sortBy === "safetensor") {
        comparison = a.safetensorFileCount - b.safetensorFileCount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    models,
    search,
    pipeline,
    family,
    architecture,
    weight,
    minFiles,
    maxFiles,
    sortBy,
    sortDirection,
  ]);

  const clearFilters = () => {
    setPipeline("");
    setFamily("");
    setArchitecture("");
    setWeight("");
    setMinFiles(undefined);
    setMaxFiles(undefined);
  };

  const handleLogout = () => {
    authService
      .logout()
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (loading) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap="size-200"
      >
        <ProgressCircle aria-label="Loading models" isIndeterminate />

        <Text>Loading AI models...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <View padding="size-400">
        <Heading level={1}>Unable to load models</Heading>

        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View
      padding={{
        base: "size-200",
        M: "size-400",
      }}
    >
      <Flex direction="column" gap="size-300">
        <Flex
          justifyContent="space-between"
          alignItems="center"
          wrap
          gap="size-200"
        >
          <View>
            <Heading level={1}>AI Model Selection Utility</Heading>

            <Text>Search, filter and compare AI models</Text>
          </View>

          <Button variant="secondary" onPress={handleLogout}>
            Sign out
          </Button>
        </Flex>

        <Divider />

        <View
          padding="size-200"
          backgroundColor={source === "api" ? "green-100" : "orange-100"}
          borderRadius="regular"
        >
          <Text>
            {source === "api"
              ? "Online — Live API data"
              : "Offline/API unavailable — Showing cached data"}
          </Text>
        </View>

        <SearchField
          label="Search models"
          placeholder="Search by model name, family or tag..."
          value={search}
          onChange={setSearch}
          width="100%"
        />

        <Flex
          direction={{
            base: "column",
            M: "row",
          }}
          gap="size-400"
          alignItems="start"
        >
          <View
            width={{
              base: "100%",
              M: "size-3000",
            }}
          >
            <Flex direction="column" gap="size-200">
              <Heading level={2}>Filters</Heading>

              <Picker
                label="Pipeline tag"
                placeholder="All pipelines"
                selectedKey={pipeline || null}
                onSelectionChange={(key) => setPipeline(key?.toString() || "")}
              >
                {filterOptions.pipelines.map((option) => (
                  <Item key={option}>{option}</Item>
                ))}
              </Picker>

              <Picker
                label="Family"
                placeholder="All families"
                selectedKey={family || null}
                onSelectionChange={(key) => setFamily(key?.toString() || "")}
              >
                {filterOptions.families.map((option) => (
                  <Item key={option}>{option}</Item>
                ))}
              </Picker>

              <Picker
                label="Architecture"
                placeholder="All architectures"
                selectedKey={architecture || null}
                onSelectionChange={(key) =>
                  setArchitecture(key?.toString() || "")
                }
              >
                {filterOptions.architectures.map((option) => (
                  <Item key={option}>{option}</Item>
                ))}
              </Picker>

              <Picker
                label="Weight / quantization"
                placeholder="All weights"
                selectedKey={weight || null}
                onSelectionChange={(key) => setWeight(key?.toString() || "")}
              >
                {filterOptions.weights.map((option) => (
                  <Item key={option}>{option}</Item>
                ))}
              </Picker>

              <NumberField
                label="Minimum safetensor files"
                value={minFiles}
                onChange={setMinFiles}
                minValue={0}
              />

              <NumberField
                label="Maximum safetensor files"
                value={maxFiles}
                onChange={setMaxFiles}
                minValue={0}
              />

              <Button variant="secondary" onPress={clearFilters}>
                Clear filters
              </Button>
            </Flex>
          </View>

          <View flex>
            <Flex direction="column" gap="size-200">
              <Flex
                justifyContent="space-between"
                alignItems="end"
                wrap
                gap="size-200"
              >
                <Text>
                  Showing <strong>{filteredModels.length}</strong> of{" "}
                  <strong>{models.length}</strong> models
                </Text>

                <Flex gap="size-200" wrap>
                  <Picker
                    label="Sort by"
                    selectedKey={sortBy}
                    onSelectionChange={(key) =>
                      setSortBy(key?.toString() || "name")
                    }
                  >
                    <Item key="name">Model name</Item>

                    <Item key="safetensor">Safetensor files</Item>
                  </Picker>

                  <Picker
                    label="Direction"
                    selectedKey={sortDirection}
                    onSelectionChange={(key) =>
                      setSortDirection(key?.toString() || "asc")
                    }
                  >
                    <Item key="asc">A → Z / smallest first</Item>

                    <Item key="desc">Z → A / largest first</Item>
                  </Picker>
                </Flex>
              </Flex>

              <Flex direction="row" wrap gap="size-200">
                {filteredModels.map((model) => (
                  <View
                    key={model.id}
                    width={{
                      base: "100%",
                      L: "size-3600",
                    }}
                    padding="size-200"
                    backgroundColor="gray-100"
                    borderColor="gray-300"
                    borderWidth="thin"
                    borderRadius="regular"
                  >
                    <Flex direction="column" gap="size-100">
                      <Heading level={3}>{model.name}</Heading>

                      <Text>Family: {model.family}</Text>

                      <Text>Pipeline: {model.pipelineTag}</Text>

                      <Text>Architecture: {model.architectureCategory}</Text>

                      <Text>Weight format: {model.weightFormat}</Text>

                      <Text>Safetensor files: {model.safetensorFileCount}</Text>

                      <Button
                        variant="secondary"
                        onPress={() =>
                          window.open(
                            model.repositoryUrl,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        View on Hugging Face
                      </Button>
                    </Flex>
                  </View>
                ))}
              </Flex>

              {filteredModels.length === 0 && (
                <View
                  padding="size-400"
                  backgroundColor="gray-100"
                  borderRadius="regular"
                >
                  <Text>No models match your search or filter criteria.</Text>
                </View>
              )}
            </Flex>
          </View>
        </Flex>
      </Flex>
    </View>
  );
}
