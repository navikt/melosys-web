import React from "react";
import { useForm } from "react-hook-form";

const VurderingInngang = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data: any) => console.log(data);
  console.log(errors);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="datetime" placeholder="periodeFraOgMed" {...register("periodeFraOgMed", { required: true })} />
      <input type="datetime" placeholder="periodeTilOgMed" {...register("periodeTilOgMed", { required: true })} />
      <select {...register("lovvalgsland", { required: true })}>
        <option value="test1">test1</option>
        <option value="test2">test2</option>
      </select>
      <input type="submit" />
    </form>
  );
};

export default VurderingInngang;
