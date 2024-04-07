import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useUserContext } from "@/context/AuthContext"
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutation"
import { PostValidation } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Models } from "appwrite"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import FileUploader from "../shared/FileUploader"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { useToast } from "../ui/use-toast"

type PostFormProps = {
  post?: Models.Document;
  action: 'create' | 'update';
}
const PostForm = ({ post, action }: PostFormProps) => {

  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost()
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost()
  const { user } = useUserContext()
  const { toast } = useToast()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      file: [],
      location: post?.location || "",
      tags: post?.tags?.join(',') || ""
    },
  })

  async function onSubmit(values: z.infer<typeof PostValidation>) {
    if (post && action === 'update') {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl
      })
      if (!updatedPost) {
        toast({ title: "Please try again" })
      }

      return navigate(`/post/${post.$id}`)
    }


    const newPost = await createPost({
      ...values,
      userId: user.id
    })

    if (!newPost) {
      toast({
        title: 'Please try again'
      })
    }

    navigate('/')
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Tags (separate by comma " , ")</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" placeholder="JS, React, NextJS" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />
        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_dark_4" onClick={() => history.back()}>Cancel</Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {isLoadingCreate || isLoadingUpdate && "Loading..."}
            {action.charAt(0).toUpperCase() + action.slice(1)} Post
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default PostForm